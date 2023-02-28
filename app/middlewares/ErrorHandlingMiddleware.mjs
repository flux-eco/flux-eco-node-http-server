class ErrorHandlingMiddleware {
    handleRequest(error, request, response, next) {
        console.error(error);
        this.sendResponse(response, 500, 'Internal server error');
    }

    sendResponse(response, status, message) {
        response.writeHead(status, { 'Content-Type': 'text/plain' });
        response.end(message);
    }
}