class LoggingMiddleware {
    handleRequest(request, response, next) {
        console.log(`Received ${request.method} request for ${request.url}`);
        next();
    }
}