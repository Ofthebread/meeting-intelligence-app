import { useContext } from 'react';
import { MeetingContext } from './meetingContextInstance.js';

export const useMeetings = () => {
    const context = useContext(MeetingContext);

    if (!context) {
        throw new Error('useMeetings must be used within a MeetingProvider');
    }

    return context;
};
