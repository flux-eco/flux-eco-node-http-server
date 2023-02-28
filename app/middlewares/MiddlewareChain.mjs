class MiddlewareChain {
    constructor(middlewares = []) {
        this.middlewares = middlewares;
    }

    handleRequest(request, response) {
        console.log('Received request', request.method, request.url);
        let currentHandlerIndex = -1;
        const next = () => {
            currentHandlerIndex++;
            if (currentHandlerIndex >= this.middlewares.length) {
                this.sendResponse(response, 404, 'Not Found');
                return;
            }
            this.middlewares[currentHandlerIndex].handleRequest(request, response, next.bind(this));
        };
        next();
    }

    sendResponse(response, status, message) {
        response.writeHead(status, {'Content-Type': 'text/plain'});
        response.end(message);
    }
}