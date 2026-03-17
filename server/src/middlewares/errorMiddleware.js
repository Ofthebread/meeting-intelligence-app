export const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Manejo de errores específicos
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            ok: false,
            message: 'Datos inválidos: ' + err.message,
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            ok: false,
            message: 'ID inválido',
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            ok: false,
            message: 'Duplicado: Este recurso ya existe',
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        ok: false,
        message:
            process.env.NODE_ENV === 'production'
                ? 'Error interno del servidor'
                : err.message,
    });
};
