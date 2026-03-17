export const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        ok: true,
        message,
        data,
    });
};

export const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        ok: false,
        message,
    });
};
