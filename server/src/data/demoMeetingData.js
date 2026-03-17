export const buildDemoMeetingResult = (title = 'Untitled meeting') => {
    return {
        title,
        transcript: [
            {
                id: 't1',
                speaker: 'Speaker 1',
                timestamp: '00:05',
                text: 'Welcome everyone. Today we need to review the onboarding flow issues reported by users.',
            },
            {
                id: 't2',
                speaker: 'Speaker 2',
                timestamp: '00:18',
                text: 'The biggest problem seems to be confusion in the document upload step.',
            },
            {
                id: 't3',
                speaker: 'Speaker 1',
                timestamp: '00:34',
                text: 'Agreed. We should simplify the instructions and add clearer validation messages.',
            },
            {
                id: 't4',
                speaker: 'Speaker 3',
                timestamp: '00:50',
                text: 'I can prepare a UX proposal by Thursday and share it with the team.',
            },
        ],
        summary: {
            overview:
                'The team reviewed issues in the onboarding flow, especially around document upload confusion. They aligned on the need to improve instructions and validation messages.',
            keyPoints: [
                'Users are struggling with the document upload step.',
                'Current instructions are not clear enough.',
                'Validation feedback should be more explicit.',
                'A UX proposal will be prepared for review.',
            ],
            decisions: [
                'Improve document upload instructions.',
                'Add better validation and error messaging.',
                'Review a UX proposal before implementation.',
            ],
            risks: [
                'If messaging stays unclear, drop-off may continue.',
                'Delaying UX review could affect sprint scope.',
            ],
        },
        actions: [
            {
                id: 'a1',
                text: 'Prepare a UX proposal for the document upload step',
                owner: 'Speaker 3',
                dueDate: 'Thursday',
                status: 'pending',
            },
            {
                id: 'a2',
                text: 'Review current validation messages and propose improvements',
                owner: 'Speaker 1',
                dueDate: 'Next sprint planning',
                status: 'pending',
            },
        ],
        speakerStats: [
            {
                speaker: 'Speaker 1',
                speakingTime: '01:20',
                contributions: 2,
            },
            {
                speaker: 'Speaker 2',
                speakingTime: '00:35',
                contributions: 1,
            },
            {
                speaker: 'Speaker 3',
                speakingTime: '00:25',
                contributions: 1,
            },
        ],
    };
};
