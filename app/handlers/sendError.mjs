const errorHandlers = {
    400: {
        message: "Bad Request",
        send: res => {
            res.statusCode = 400;
            res.end("Bad Request");
        },
    },
    401: {
        message: "Unauthorized",
        send: res => {
            res.statusCode = 401;
            res.end("Unauthorized");
        },
    },
    403: {
        message: "Forbidden",
        send: res => {
            res.statusCode = 403;
            res.end("Forbidden");
        },
    },
    404: {
        message: "Not Found",
        send: res => {
            res.statusCode = 404;
            res.end("Not Found");
        },
    },
    500: {
        message: "Internal Server Error",
        send: res => {
            res.statusCode = 500;
            res.end("Internal Server Error");
        },
    },
};

export const sendError = (res, code) => {
    const errorHandler = errorHandlers[code];
    if (errorHandler) {
        errorHandler.send(res);
    } else {
        errorHandler[500].send(res);
    }
};