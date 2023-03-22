class ResponseContentLoggerMiddleware {
    constructor() {}
    async handleRequest(req, res, next) {
        await next();
        console.log(res);
    }
}