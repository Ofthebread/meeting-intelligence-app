import { useState, useEffect } from 'react';
import { meetingApi } from '../services/api';
import { MeetingContext } from './meetingContextInstance.js';

export const MeetingProvider = ({ children }) => {
    const [meetings, setMeetings] = useState([]);
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [apiStatus, setApiStatus] = useState('Checking API');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadHealth();
        loadMeetings();
    }, []);

    const loadHealth = async () => {
        try {
            const response = await meetingApi.getHealth();
            setApiStatus(response.data.message || 'API available');
        } catch (err) {
            setApiStatus('API unavailable');
            console.error('Error loading API health:', err);
        }
    };

    const loadMeetings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.getMeetings();
            setMeetings(response.data.data);
        } catch (err) {
            setError('Failed to load meetings');
            console.error('Error loading meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    const createMeeting = async (title, recording = null) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.createMeeting({ title, recording });
            const newMeeting = response.data.data;
            setMeetings((prev) => [newMeeting, ...prev]);
            setCurrentMeeting(newMeeting);
            return newMeeting;
        } catch (err) {
            setError('Failed to create meeting');
            console.error('Error creating meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loadMeeting = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.getMeeting(id);
            const meeting = response.data.data;
            setCurrentMeeting(meeting);
            return meeting;
        } catch (err) {
            setError('Failed to load meeting');
            console.error('Error loading meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const processDemo = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.processDemo(id);
            const updatedMeeting = response.data.data;

            // Update the meeting in the list
            setMeetings((prev) =>
                prev.map((m) => (m.id === id ? updatedMeeting : m)),
            );
            setCurrentMeeting(updatedMeeting);

            return updatedMeeting;
        } catch (err) {
            setError('Failed to process meeting');
            console.error('Error processing meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const analyzeMeeting = async (title, audioFile) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.analyzeMeeting(title, audioFile);
            const analyzedMeeting = response.data.data;

            setMeetings((prev) => {
                const exists = prev.some((meeting) => meeting.id === analyzedMeeting.id);

                if (exists) {
                    return prev.map((meeting) =>
                        meeting.id === analyzedMeeting.id ? analyzedMeeting : meeting,
                    );
                }

                return [analyzedMeeting, ...prev];
            });
            setCurrentMeeting(analyzedMeeting);

            return analyzedMeeting;
        } catch (err) {
            setError('Failed to analyze meeting');
            console.error('Error analyzing meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMeetingTitle = async (id, title) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.updateMeeting(id, { title });
            const updatedMeeting = response.data.data;

            setMeetings((prev) =>
                prev.map((meeting) =>
                    meeting.id === updatedMeeting.id ? updatedMeeting : meeting,
                ),
            );
            setCurrentMeeting((prev) =>
                prev?.id === updatedMeeting.id ? updatedMeeting : prev,
            );

            return updatedMeeting;
        } catch (err) {
            setError('Failed to update meeting');
            console.error('Error updating meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMeeting = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await meetingApi.deleteMeeting(id);

            let nextCurrentMeeting = null;

            setMeetings((prev) => {
                const remainingMeetings = prev.filter((meeting) => meeting.id !== id);
                nextCurrentMeeting = remainingMeetings.at(-1) || null;
                return remainingMeetings;
            });

            setCurrentMeeting((current) => {
                if (current?.id !== id) {
                    return current;
                }

                return nextCurrentMeeting;
            });
        } catch (err) {
            setError('Failed to delete meeting');
            console.error('Error deleting meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const exportMeeting = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingApi.exportMeeting(id);
            return response.data.data;
        } catch (err) {
            setError('Failed to export meeting');
            console.error('Error exporting meeting:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        apiStatus,
        meetings,
        currentMeeting,
        loading,
        error,
        createMeeting,
        analyzeMeeting,
        loadMeeting,
        loadHealth,
        processDemo,
        updateMeetingTitle,
        deleteMeeting,
        exportMeeting,
        loadMeetings,
        setCurrentMeeting,
        setError,
    };

    return (
        <MeetingContext.Provider value={value}>
            {children}
        </MeetingContext.Provider>
    );
};
