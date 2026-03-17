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

    create(title = 'Untitled meeting') {
        const newMeeting = {
            id: generateId(),
            title,
            status: 'created',
            createdAt: new Date().toISOString(),
            transcript: [],
            summary: null,
            actions: [],
            speakerStats: [],
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
        meeting.transcript = demoResult.transcript;
        meeting.summary = demoResult.summary;
        meeting.actions = demoResult.actions;
        meeting.speakerStats = demoResult.speakerStats;
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
};
