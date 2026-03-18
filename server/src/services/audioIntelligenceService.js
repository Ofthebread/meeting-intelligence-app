import { env } from '../config/env.js';

function buildApiUrl(pathname) {
    const baseUrl = env.audioIntelligenceApiUrl.replace(/\/$/, '');
    return `${baseUrl}${pathname}`;
}

function buildAnalysisMode(job) {
    const transcriptionProvider = job?.metadata?.transcriptionProvider || '';
    const insightsMode = job?.metadata?.insightsMode || '';

    // We surface fallback mode clearly so the UI can distinguish
    // between a full analysis path and a degraded local summary path.
    if (transcriptionProvider === 'mock' || insightsMode === 'fallback') {
        return 'live-fallback';
    }

    return 'live';
}

function normalizeSpeakerAnalysis(job) {
    const baseAnalysis = job?.speakerAnalysis || null;

    if (!baseAnalysis) {
        return null;
    }

    return {
        ...baseAnalysis,
        provider: job?.metadata?.transcriptionProvider || null,
    };
}

export const audioIntelligenceService = {
    async analyzeMeeting({ title, file, language = 'es' }) {
        const formData = new FormData();

        formData.append('title', title);
        formData.append('language', language);
        formData.append(
            'audio',
            new Blob([file.buffer], {
                type: file.mimetype || 'application/octet-stream',
            }),
            file.originalname || 'meeting-audio.webm',
        );

        const response = await fetch(buildApiUrl('/transcriptions'), {
            method: 'POST',
            body: formData,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(
                payload?.message ||
                    'Audio Intelligence API request failed while analyzing the meeting.',
            );
            error.status = response.status;
            throw error;
        }

        const job = payload?.data;

        if (!job) {
            const error = new Error(
                'Audio Intelligence API returned an empty transcription job.',
            );
            error.status = 502;
            throw error;
        }

        return {
            transcript: job.transcript || [],
            summary: job.summary || null,
            actions: job.actions || [],
            speakerStats: job.speakerStats || [],
            speakerAnalysis: normalizeSpeakerAnalysis(job),
            analysisMode: buildAnalysisMode(job),
        };
    },
};
