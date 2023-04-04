class RequestContentLoggerMiddleware {
    constructor() {}

    async handleRequest(req, res, next) {
        console.log(req);
        next();
    }
}