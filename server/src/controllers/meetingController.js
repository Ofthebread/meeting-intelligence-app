import { meetingService } from '../services/meetingService.js';
import { audioIntelligenceService } from '../services/audioIntelligenceService.js';
import { validateMeetingTitle } from '../utils/validators.js';

export const meetingController = {
    health(req, res) {
        res.status(200).json({
            ok: true,
            message: 'Meeting Intelligence API is running',
        });
    },

    getMeetings(req, res) {
        const meetings = meetingService.getAll();

        res.status(200).json({
            ok: true,
            data: meetings,
        });
    },

    getMeetingById(req, res) {
        const { id } = req.params;
        const meeting = meetingService.getById(id);

        if (!meeting) {
            return res.status(404).json({
                ok: false,
                message: 'Meeting not found',
            });
        }

        res.status(200).json({
            ok: true,
            data: meeting,
        });
    },

    createMeeting(req, res) {
        const { title, recording } = req.body;
        const validation = validateMeetingTitle(title);

        if (!validation.valid) {
            return res.status(400).json({
                ok: false,
                message: validation.message,
            });
        }

        const meeting = meetingService.create(title?.trim(), recording || null);

        res.status(201).json({
            ok: true,
            message: 'Meeting created successfully',
            data: meeting,
        });
    },

    processDemoMeeting(req, res) {
        const { id } = req.params;
        const meeting = meetingService.processDemo(id);

        if (!meeting) {
            return res.status(404).json({
                ok: false,
                message: 'Meeting not found',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Meeting processed in demo mode',
            data: meeting,
        });
    },

    async analyzeMeeting(req, res, next) {
        try {
            const { title } = req.body;
            const validation = validateMeetingTitle(title);

            if (!validation.valid) {
                return res.status(400).json({
                    ok: false,
                    message: validation.message,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    ok: false,
                    message: 'Audio file is required',
                });
            }

            const meeting = meetingService.create(title?.trim(), {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
            });

            meetingService.markAsProcessing(meeting.id);

            const analysisResult = await audioIntelligenceService.analyzeMeeting({
                title: meeting.title,
                file: req.file,
            });

            const completedMeeting = meetingService.completeAnalysis(
                meeting.id,
                analysisResult,
                analysisResult.analysisMode || 'live',
            );

            res.status(201).json({
                ok: true,
                message: 'Meeting analyzed successfully',
                data: completedMeeting,
            });
        } catch (error) {
            next(error);
        }
    },

    exportMeeting(req, res) {
        const { id } = req.params;
        const meeting = meetingService.getById(id);

        if (!meeting) {
            return res.status(404).json({
                ok: false,
                message: 'Meeting not found',
            });
        }

        res.status(200).json({
            ok: true,
            data: {
                id: meeting.id,
                title: meeting.title,
                createdAt: meeting.createdAt,
                processedAt: meeting.processedAt || null,
                transcript: meeting.transcript,
                summary: meeting.summary,
                actions: meeting.actions,
                speakerStats: meeting.speakerStats,
                speakerAnalysis: meeting.speakerAnalysis || null,
            },
        });
    },
    updateMeeting(req, res) {
        const { id } = req.params;
        const { title } = req.body;

        const validation = validateMeetingTitle(title);

        if (!validation.valid) {
            return res.status(400).json({
                ok: false,
                message: validation.message,
            });
        }

        const meeting = meetingService.updateTitle(id, title.trim());

        if (!meeting) {
            return res.status(404).json({
                ok: false,
                message: 'Meeting not found',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Meeting updated successfully',
            data: meeting,
        });
    },
};
