import { buildDemoMeetingResult } from '../data/demoMeetingData.js';
import { generateId } from '../utils/id.js';

const meetings = [];

export const meetingService = {
    getAll() {
        return meetings;
    },

    getById(id) {
        return meetings.find((meeting) => meeting.id === id) || null;
    },

    create(title = 'Untitled meeting', recording = null) {
        const newMeeting = {
            id: generateId(),
            title,
            status: 'created',
            createdAt: new Date().toISOString(),
            recording,
            transcript: [],
            summary: null,
            actions: [],
            speakerStats: [],
            speakerAnalysis: null,
            analysisMode: null,
        };

        meetings.push(newMeeting);
        return newMeeting;
    },

    markAsProcessing(id) {
        const meeting = meetings.find((item) => item.id === id);

        if (!meeting) return null;

        meeting.status = 'processing';
        meeting.processingStartedAt = new Date().toISOString();

        return meeting;
    },

    processDemo(id) {
        const meeting = meetings.find((item) => item.id === id);

        if (!meeting) return null;

        meeting.status = 'processing';
        meeting.processingStartedAt = new Date().toISOString();

        const demoResult = buildDemoMeetingResult(meeting.title);

        meeting.status = 'completed';
        meeting.analysisMode = 'demo';
        meeting.transcript = demoResult.transcript;
        meeting.summary = demoResult.summary;
        meeting.actions = demoResult.actions;
        meeting.speakerStats = demoResult.speakerStats;
        meeting.speakerAnalysis = {
            mode: 'demo',
            note: 'This speaker breakdown comes from mock demo data.',
            count: demoResult.speakerStats.length,
        };
        meeting.processedAt = new Date().toISOString();

        return meeting;
    },

    completeAnalysis(id, analysisResult, analysisMode = 'live') {
        const meeting = meetings.find((item) => item.id === id);

        if (!meeting) return null;

        meeting.status = 'completed';
        meeting.analysisMode = analysisMode;
        meeting.transcript = analysisResult.transcript;
        meeting.summary = analysisResult.summary;
        meeting.actions = analysisResult.actions;
        meeting.speakerStats = analysisResult.speakerStats;
        meeting.speakerAnalysis = analysisResult.speakerAnalysis || null;
        meeting.processedAt = new Date().toISOString();

        return meeting;
    },
    updateTitle(id, title) {
        const meeting = meetings.find((item) => item.id === id);

        if (!meeting) return null;

        meeting.title = title;
        meeting.updatedAt = new Date().toISOString();

        return meeting;
    },
    remove(id) {
        const meetingIndex = meetings.findIndex((item) => item.id === id);

        if (meetingIndex === -1) return null;

        const [removedMeeting] = meetings.splice(meetingIndex, 1);
        return removedMeeting;
    },
};
