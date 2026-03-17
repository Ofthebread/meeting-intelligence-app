import { env } from '../config/env.js';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

function toTimestamp(seconds = 0) {
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function normalizeTranscriptSegments(transcription) {
    const segments = Array.isArray(transcription?.segments)
        ? transcription.segments
        : [];

    if (segments.length === 0 && transcription?.text) {
        return [
            {
                id: 't1',
                speaker: 'Speaker 1',
                timestamp: '00:00',
                text: transcription.text,
            },
        ];
    }

    return segments.map((segment, index) => ({
        id: `t${index + 1}`,
        speaker: segment.speaker || `Speaker ${segment.speaker_id || 1}`,
        timestamp: toTimestamp(segment.start ?? 0),
        text: segment.text?.trim() || '',
    }));
}

function getSpeakerAnalysisMeta(transcription, transcript) {
    const segments = Array.isArray(transcription?.segments)
        ? transcription.segments
        : [];
    const hasModelSpeakerLabels = segments.some(
        (segment) => segment.speaker || segment.speaker_id !== undefined,
    );

    if (hasModelSpeakerLabels) {
        return {
            mode: 'model',
            note: 'Speaker labels came from the transcription output.',
            count: new Set(transcript.map((entry) => entry.speaker)).size,
        };
    }

    return {
        mode: 'estimated',
        note: 'Speaker labels and speaking time are estimated placeholders, not true diarization.',
        count: new Set(transcript.map((entry) => entry.speaker)).size,
    };
}

function buildSpeakerStats(transcript) {
    const speakerMap = new Map();

    transcript.forEach((entry) => {
        const existing = speakerMap.get(entry.speaker) || {
            speaker: entry.speaker,
            contributions: 0,
            speakingSeconds: 0,
        };

        existing.contributions += 1;
        existing.speakingSeconds += 15;
        speakerMap.set(entry.speaker, existing);
    });

    return Array.from(speakerMap.values()).map((speaker) => ({
        speaker: speaker.speaker,
        contributions: speaker.contributions,
        speakingTime: toTimestamp(speaker.speakingSeconds),
    }));
}

function parseJsonPayload(content) {
    if (typeof content === 'string') {
        return JSON.parse(content);
    }

    if (Array.isArray(content)) {
        const textPart = content.find(
            (item) => item.type === 'output_text' || item.type === 'text',
        );

        if (textPart?.text) {
            return JSON.parse(textPart.text);
        }
    }

    throw new Error('Could not parse model JSON output');
}

async function transcribeAudio(file) {
    const formData = new FormData();
    const audioBlob = new Blob([file.buffer], {
        type: file.mimetype || 'audio/webm',
    });

    formData.append('file', audioBlob, file.originalname || 'meeting.webm');
    formData.append('model', 'gpt-4o-transcribe');
    formData.append('response_format', 'verbose_json');

    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.openaiApiKey}`,
        },
        body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(
            payload?.error?.message || 'OpenAI transcription failed',
        );
    }

    return payload;
}

async function summarizeTranscript({ title, transcript }) {
    const transcriptText = transcript
        .map((entry) => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
        .join('\n');

    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.openaiApiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4.1-mini',
            input: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'input_text',
                            text: 'You analyze meeting transcripts. Return strict JSON with keys: overview, keyPoints, decisions, risks, actions. Actions must be an array of objects with text, owner, dueDate, status.',
                        },
                    ],
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: `Meeting title: ${title}\n\nTranscript:\n${transcriptText}`,
                        },
                    ],
                },
            ],
            text: {
                format: {
                    type: 'json_schema',
                    name: 'meeting_analysis',
                    schema: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            overview: { type: 'string' },
                            keyPoints: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            decisions: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            risks: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            actions: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    additionalProperties: false,
                                    properties: {
                                        text: { type: 'string' },
                                        owner: { type: 'string' },
                                        dueDate: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                    required: [
                                        'text',
                                        'owner',
                                        'dueDate',
                                        'status',
                                    ],
                                },
                            },
                        },
                        required: [
                            'overview',
                            'keyPoints',
                            'decisions',
                            'risks',
                            'actions',
                        ],
                    },
                },
            },
        }),
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(
            payload?.error?.message || 'OpenAI summary generation failed',
        );
    }

    return parseJsonPayload(
        payload.output_text || payload.output?.[0]?.content,
    );
}

export const openaiMeetingAnalysisService = {
    async analyzeMeeting({ title, file }) {
        if (!env.openaiApiKey) {
            const error = new Error(
                'OpenAI API key is required for real analysis. Use "Run demo analysis" instead, or add OPENAI_API_KEY to server/.env',
            );
            error.status = 400;
            throw error;
        }

        if (!file?.buffer) {
            const error = new Error('Audio file is required');
            error.status = 400;
            throw error;
        }

        if (env.hasPlaceholderOpenAiKey) {
            const error = new Error(
                'Replace the OPENAI_API_KEY placeholder in server/.env with a real API key.',
            );
            error.status = 400;
            throw error;
        }

        const transcription = await transcribeAudio(file);
        const transcript = normalizeTranscriptSegments(transcription);
        const summaryPayload = await summarizeTranscript({ title, transcript });
        const speakerAnalysis = getSpeakerAnalysisMeta(transcription, transcript);

        return {
            transcript,
            summary: {
                overview: summaryPayload.overview,
                keyPoints: summaryPayload.keyPoints,
                decisions: summaryPayload.decisions,
                risks: summaryPayload.risks,
            },
            actions: summaryPayload.actions.map((action, index) => ({
                id: `a${index + 1}`,
                text: action.text,
                owner: action.owner,
                dueDate: action.dueDate,
                status: action.status,
            })),
            speakerStats: buildSpeakerStats(transcript),
            speakerAnalysis,
        };
    },
};
