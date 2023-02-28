class LoggerMiddleware {
    constructor() {}

    async handleRequest(req, res, next) {
        console.log(`Request received at ${new Date()}`);
        next();
    }
}