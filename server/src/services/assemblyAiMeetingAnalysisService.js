import { env } from '../config/env.js';

const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';
const LEMUR_BASE_URL = 'https://api.assemblyai.com/lemur/v3';
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 120;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function toTimestamp(milliseconds = 0) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseJsonText(text) {
    const trimmed = text.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    return JSON.parse(trimmed);
}

function normalizeTranscript(transcript) {
    const utterances = Array.isArray(transcript?.utterances) ? transcript.utterances : [];

    if (utterances.length === 0 && transcript?.text) {
        return [
            {
                id: 't1',
                speaker: 'Speaker 1',
                timestamp: '00:00',
                text: transcript.text,
            },
        ];
    }

    return utterances.map((utterance, index) => ({
        id: `t${index + 1}`,
        speaker: `Speaker ${utterance.speaker ?? 1}`,
        timestamp: toTimestamp(utterance.start),
        text: utterance.text?.trim() || '',
        start: utterance.start ?? 0,
        end: utterance.end ?? utterance.start ?? 0,
    }));
}

function buildSpeakerStats(transcript) {
    const speakerMap = new Map();

    transcript.forEach((entry) => {
        const existing = speakerMap.get(entry.speaker) || {
            speaker: entry.speaker,
            contributions: 0,
            durationMs: 0,
        };

        existing.contributions += 1;
        existing.durationMs += Math.max(0, (entry.end ?? 0) - (entry.start ?? 0));
        speakerMap.set(entry.speaker, existing);
    });

    return Array.from(speakerMap.values()).map((speaker) => ({
        speaker: speaker.speaker,
        contributions: speaker.contributions,
        speakingTime: toTimestamp(speaker.durationMs),
    }));
}

function uniqueStrings(values) {
    return [...new Set(values.filter(Boolean))];
}

function pickSentencesByKeywords(transcript, keywords, limit = 3) {
    return uniqueStrings(
        transcript
            .filter((entry) =>
                keywords.some((keyword) =>
                    entry.text.toLowerCase().includes(keyword),
                ),
            )
            .map((entry) => entry.text.trim())
            .slice(0, limit),
    );
}

function buildLocalInsights(title, transcript) {
    const nonEmptyTranscript = transcript.filter((entry) => entry.text?.trim());
    const keyPoints = uniqueStrings(
        nonEmptyTranscript.slice(0, 4).map((entry) => entry.text.trim()),
    );
    const decisions = pickSentencesByKeywords(
        nonEmptyTranscript,
        ['decide', 'decision', 'agreed', 'we will', 'let us', "let's"],
        3,
    );
    const risks = pickSentencesByKeywords(
        nonEmptyTranscript,
        ['risk', 'blocker', 'issue', 'problem', 'delay'],
        3,
    );

    const actions = nonEmptyTranscript
        .filter((entry) =>
            ['i will', 'we need to', 'should', 'follow up', 'next step', 'action']
                .some((keyword) => entry.text.toLowerCase().includes(keyword)),
        )
        .slice(0, 5)
        .map((entry, index) => ({
            id: `a${index + 1}`,
            text: entry.text.trim(),
            owner: entry.speaker || 'Unassigned',
            dueDate: 'Not specified',
            status: 'pending',
        }));

    return {
        analysisMode: 'live-fallback',
        transcript,
        summary: {
            overview:
                keyPoints[0]
                    ? `Fallback transcript analysis for "${title}". ${keyPoints[0]}`
                    : `Fallback transcript analysis for "${title}".`,
            keyPoints,
            decisions,
            risks,
        },
        actions:
            actions.length > 0
                ? actions
                : [
                      {
                          id: 'a1',
                          text: 'Review the transcript and assign concrete next steps.',
                          owner: 'Unassigned',
                          dueDate: 'Not specified',
                          status: 'pending',
                      },
                  ],
    };
}

async function uploadAudio(file) {
    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            authorization: env.assemblyAiApiKey,
            'content-type': 'application/octet-stream',
        },
        body: file.buffer,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error || 'AssemblyAI upload failed');
    }

    return payload.upload_url;
}

async function createTranscript(audioUrl) {
    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
        method: 'POST',
        headers: {
            authorization: env.assemblyAiApiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            audio_url: audioUrl,
            speech_models: ['universal-2'],
            speaker_labels: true,
            auto_chapters: false,
            punctuate: true,
            format_text: true,
        }),
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error || 'AssemblyAI transcript creation failed');
    }

    return payload.id;
}

async function pollTranscript(transcriptId) {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
            headers: {
                authorization: env.assemblyAiApiKey,
            },
        });
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload?.error || 'AssemblyAI transcript polling failed');
        }

        if (payload.status === 'completed') {
            return payload;
        }

        if (payload.status === 'error') {
            throw new Error(payload.error || 'AssemblyAI transcription failed');
        }

        await sleep(POLL_INTERVAL_MS);
    }

    throw new Error('AssemblyAI transcription timed out');
}

async function generateInsights(transcriptId, title) {
    const response = await fetch(`${LEMUR_BASE_URL}/generate/task`, {
        method: 'POST',
        headers: {
            authorization: env.assemblyAiApiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            transcript_ids: [transcriptId],
            final_model: 'anthropic/claude-sonnet-4-20250514',
            prompt: `Analyze the meeting transcript for "${title}". Return valid JSON only with this exact shape:
{
  "overview": "string",
  "keyPoints": ["string"],
  "decisions": ["string"],
  "risks": ["string"],
  "actions": [
    {
      "text": "string",
      "owner": "string",
      "dueDate": "string",
      "status": "pending"
    }
  ]
}
Do not include markdown fences or extra text.`,
        }),
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error || 'AssemblyAI LeMUR analysis failed');
    }

    return parseJsonText(payload.response || '');
}

export const assemblyAiMeetingAnalysisService = {
    async analyzeMeeting({ title, file }) {
        if (!env.assemblyAiApiKey) {
            const error = new Error(
                'AssemblyAI API key is required for real analysis. Add ASSEMBLYAI_API_KEY to server/.env',
            );
            error.status = 400;
            throw error;
        }

        if (env.hasPlaceholderAssemblyAiKey) {
            const error = new Error(
                'Replace the ASSEMBLYAI_API_KEY placeholder in server/.env with a real key.',
            );
            error.status = 400;
            throw error;
        }

        if (!file?.buffer) {
            const error = new Error('Audio file is required');
            error.status = 400;
            throw error;
        }

        const audioUrl = await uploadAudio(file);
        const transcriptId = await createTranscript(audioUrl);
        const transcriptPayload = await pollTranscript(transcriptId);
        const transcript = normalizeTranscript(transcriptPayload);
        let insights;
        let analysisMode = 'live';

        try {
            insights = await generateInsights(transcriptId, title);
        } catch (error) {
            insights = buildLocalInsights(title, transcript);
            analysisMode = insights.analysisMode;
        }

        return {
            analysisMode,
            transcript,
            summary: {
                overview: insights.summary?.overview || insights.overview,
                keyPoints: insights.summary?.keyPoints || insights.keyPoints || [],
                decisions: insights.summary?.decisions || insights.decisions || [],
                risks: insights.summary?.risks || insights.risks || [],
            },
            actions: (insights.actions || []).map((action, index) => ({
                id: `a${index + 1}`,
                text: action.text,
                owner: action.owner || 'Unassigned',
                dueDate: action.dueDate || 'Not specified',
                status: action.status || 'pending',
            })),
            speakerStats: buildSpeakerStats(transcript),
            speakerAnalysis: {
                mode: transcriptPayload.utterances?.length ? 'model' : 'estimated',
                note: `${
                    transcriptPayload.utterances?.length
                        ? 'Speaker labels came from AssemblyAI utterance segmentation.'
                        : 'Speaker labels are estimated because no utterances were returned.'
                } ${
                    analysisMode === 'live-fallback'
                        ? 'Summary and actions were generated by a local fallback because LeMUR was unavailable.'
                        : ''
                }`.trim(),
                count: new Set(transcript.map((entry) => entry.speaker)).size,
            },
        };
    },
};
