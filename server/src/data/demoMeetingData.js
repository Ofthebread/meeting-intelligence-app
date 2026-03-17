const scenarios = [
    {
        match: ['onboarding', 'signup', 'activation'],
        transcript: [
            {
                id: 't1',
                speaker: 'Nina',
                timestamp: '00:04',
                text: 'We are still seeing user drop-off during onboarding, mostly around document upload and identity verification.',
            },
            {
                id: 't2',
                speaker: 'Sam',
                timestamp: '00:19',
                text: 'Support tickets show users do not understand the file requirements until after they fail the first attempt.',
            },
            {
                id: 't3',
                speaker: 'Nina',
                timestamp: '00:41',
                text: 'We should rewrite the copy, add examples of acceptable documents, and make validation messages more explicit.',
            },
            {
                id: 't4',
                speaker: 'Lara',
                timestamp: '00:58',
                text: 'I can prepare a revised UX flow and bring a prototype to the team review on Thursday.',
            },
        ],
        summary: {
            overview:
                'The team reviewed onboarding friction and aligned on improving upload guidance, clearer validation, and a revised UX proposal.',
            keyPoints: [
                'Document upload and verification are the main sources of onboarding drop-off.',
                'Users discover file requirements too late in the flow.',
                'Copy and validation feedback need to be rewritten with concrete examples.',
                'A UX prototype will be prepared for team review.',
            ],
            decisions: [
                'Update document guidance before the next release.',
                'Make validation messages more specific and actionable.',
                'Review the revised UX prototype before implementation starts.',
            ],
            risks: [
                'Retention may continue to fall if onboarding remains unclear.',
                'A delayed review would push implementation past the sprint boundary.',
            ],
        },
        actions: [
            {
                id: 'a1',
                text: 'Draft a new upload guidance and validation message set',
                owner: 'Nina',
                dueDate: 'Wednesday',
                status: 'pending',
            },
            {
                id: 'a2',
                text: 'Prepare an onboarding UX prototype for review',
                owner: 'Lara',
                dueDate: 'Thursday',
                status: 'pending',
            },
        ],
        speakerStats: [
            { speaker: 'Nina', speakingTime: '01:20', contributions: 2 },
            { speaker: 'Sam', speakingTime: '00:34', contributions: 1 },
            { speaker: 'Lara', speakingTime: '00:28', contributions: 1 },
        ],
    },
    {
        match: ['sales', 'pipeline', 'revenue', 'customer'],
        transcript: [
            {
                id: 't1',
                speaker: 'Marco',
                timestamp: '00:03',
                text: 'Pipeline coverage is stable, but enterprise deals are taking longer than forecast because legal review is slowing procurement.',
            },
            {
                id: 't2',
                speaker: 'Ava',
                timestamp: '00:21',
                text: 'We can reduce that delay if we send the security packet and redline template earlier in the cycle.',
            },
            {
                id: 't3',
                speaker: 'Marco',
                timestamp: '00:39',
                text: 'Good. Let us make that the standard motion for any deal above fifty thousand.',
            },
            {
                id: 't4',
                speaker: 'Jon',
                timestamp: '00:57',
                text: 'I will update the sales playbook and train account executives during Friday standup.',
            },
        ],
        summary: {
            overview:
                'The team discussed slower enterprise deal cycles and agreed to front-load security and legal materials to protect revenue timing.',
            keyPoints: [
                'Enterprise deals are slipping because legal review starts too late.',
                'Early delivery of security and redline materials should shorten procurement.',
                'The new motion will apply to larger deals first.',
                'Enablement will update the playbook and brief account executives.',
            ],
            decisions: [
                'Send legal and security documents earlier for enterprise opportunities.',
                'Apply the new process to deals above fifty thousand.',
                'Update enablement material this week.',
            ],
            risks: [
                'Forecast risk remains if reps do not adopt the new process quickly.',
                'Large deals may still slip if customer legal teams are understaffed.',
            ],
        },
        actions: [
            {
                id: 'a1',
                text: 'Update the enterprise sales playbook with the new procurement workflow',
                owner: 'Jon',
                dueDate: 'Friday',
                status: 'pending',
            },
            {
                id: 'a2',
                text: 'Package security and legal documents for early-stage enterprise deals',
                owner: 'Ava',
                dueDate: 'This week',
                status: 'pending',
            },
        ],
        speakerStats: [
            { speaker: 'Marco', speakingTime: '01:05', contributions: 2 },
            { speaker: 'Ava', speakingTime: '00:31', contributions: 1 },
            { speaker: 'Jon', speakingTime: '00:26', contributions: 1 },
        ],
    },
    {
        match: ['hiring', 'candidate', 'interview', 'recruiting'],
        transcript: [
            {
                id: 't1',
                speaker: 'Priya',
                timestamp: '00:05',
                text: 'We have three strong backend candidates, but feedback quality is inconsistent across interviewers.',
            },
            {
                id: 't2',
                speaker: 'Diego',
                timestamp: '00:22',
                text: 'Some scorecards are detailed and some only say strong yes, which makes final calibration harder.',
            },
            {
                id: 't3',
                speaker: 'Priya',
                timestamp: '00:38',
                text: 'We need a tighter rubric with explicit signals for architecture, debugging, and communication.',
            },
            {
                id: 't4',
                speaker: 'Helen',
                timestamp: '00:55',
                text: 'I can draft a new scorecard template and test it with the next interview panel.',
            },
        ],
        summary: {
            overview:
                'The hiring team identified inconsistent scorecards as the main blocker to clear candidate calibration and agreed to tighten the interview rubric.',
            keyPoints: [
                'Candidate quality is good, but evaluator inputs are uneven.',
                'Current scorecards are too vague for reliable calibration.',
                'The team wants clearer criteria for architecture, debugging, and communication.',
                'A new template will be piloted with the next panel.',
            ],
            decisions: [
                'Replace the current scorecard with a stricter rubric.',
                'Pilot the revised template in the next backend interview round.',
                'Review calibration quality after the pilot.',
            ],
            risks: [
                'Hiring velocity may slow if interviewers are not trained on the new rubric.',
                'Calibration bias may continue if feedback remains inconsistent.',
            ],
        },
        actions: [
            {
                id: 'a1',
                text: 'Draft a revised backend interview scorecard template',
                owner: 'Helen',
                dueDate: 'Monday',
                status: 'pending',
            },
            {
                id: 'a2',
                text: 'Define explicit evaluation signals for architecture and debugging',
                owner: 'Priya',
                dueDate: 'Monday',
                status: 'pending',
            },
        ],
        speakerStats: [
            { speaker: 'Priya', speakingTime: '01:12', contributions: 2 },
            { speaker: 'Diego', speakingTime: '00:29', contributions: 1 },
            { speaker: 'Helen', speakingTime: '00:24', contributions: 1 },
        ],
    },
]

const defaultScenario = {
    transcript: [
        {
            id: 't1',
            speaker: 'Speaker 1',
            timestamp: '00:05',
            text: 'We reviewed the current project priorities and aligned on the work that needs to move first this week.',
        },
        {
            id: 't2',
            speaker: 'Speaker 2',
            timestamp: '00:18',
            text: 'The main blockers are scope clarity, ownership, and getting stakeholders the right update before Friday.',
        },
        {
            id: 't3',
            speaker: 'Speaker 1',
            timestamp: '00:36',
            text: 'Let us lock decisions today, publish the summary, and assign owners with concrete due dates.',
        },
        {
            id: 't4',
            speaker: 'Speaker 3',
            timestamp: '00:55',
            text: 'I will prepare the follow-up note and make sure each action is tracked in the project board.',
        },
    ],
    summary: {
        overview:
            'The meeting focused on priorities, blockers, and assigning ownership so the team can move quickly on near-term deliverables.',
        keyPoints: [
            'The team aligned on the most urgent priorities for the week.',
            'Current blockers are scope clarity, ownership, and stakeholder communication.',
            'The group wants to leave the meeting with explicit decisions and due dates.',
            'A follow-up summary will be shared with tracked action items.',
        ],
        decisions: [
            'Prioritize the most time-sensitive deliverables first.',
            'Assign explicit owners to each open item.',
            'Share a follow-up summary after the meeting.',
        ],
        risks: [
            'Execution could drift if ownership remains ambiguous.',
            'Stakeholders may lose confidence if updates are delayed.',
        ],
    },
    actions: [
        {
            id: 'a1',
            text: 'Send a written meeting summary with owners and due dates',
            owner: 'Speaker 3',
            dueDate: 'End of day',
            status: 'pending',
        },
        {
            id: 'a2',
            text: 'Confirm owners for each open workstream',
            owner: 'Speaker 1',
            dueDate: 'Tomorrow',
            status: 'pending',
        },
    ],
    speakerStats: [
        { speaker: 'Speaker 1', speakingTime: '01:15', contributions: 2 },
        { speaker: 'Speaker 2', speakingTime: '00:36', contributions: 1 },
        { speaker: 'Speaker 3', speakingTime: '00:24', contributions: 1 },
    ],
}

function getScenario(title = '') {
    const normalizedTitle = title.toLowerCase()

    return (
        scenarios.find((scenario) =>
            scenario.match.some((keyword) => normalizedTitle.includes(keyword)),
        ) || defaultScenario
    )
}

export const buildDemoMeetingResult = (title = 'Untitled meeting') => {
    const scenario = getScenario(title)

    return {
        title,
        transcript: scenario.transcript,
        summary: scenario.summary,
        actions: scenario.actions,
        speakerStats: scenario.speakerStats,
    }
}
