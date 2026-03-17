export const validateMeetingTitle = (title) => {
    if (title === undefined || title === null) {
        return { valid: true };
    }

    if (typeof title !== 'string') {
        return {
            valid: false,
            message: 'Title must be a string',
        };
    }

    if (title.trim().length === 0) {
        return {
            valid: false,
            message: 'Title cannot be empty',
        };
    }

    if (title.trim().length > 120) {
        return {
            valid: false,
            message: 'Title cannot exceed 120 characters',
        };
    }

    return { valid: true };
};
