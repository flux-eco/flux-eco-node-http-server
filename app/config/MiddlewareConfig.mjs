
/**
 * Represents a middleware chain for handling HTTP requests.
 */
class MiddlewareChain {
    /**
     * Creates an instance of MiddlewareChain.
     * @param {Object[]} middlewareArray - An array of middleware objects to use in the chain.
     */
    constructor(middlewareArray) {
        this.middlewareArray = middlewareArray;
    }

    /**
     * Handles an HTTP request by passing it through each middleware object in the chain.
     * @param {http.IncomingMessage} req - The incoming HTTP request object.
     * @param {http.ServerResponse} res - The HTTP response object to send the response through.
     * @param {Function} [next] - An optional callback function to call after all middleware objects have been processed.
     */
    handleRequest(req, res, next) {
        let index = -1;

        const runMiddleware = () => {
            index++;

            if (index >= this.middlewareArray.length) {
                if (next) {
                    next();
                } else {
                    res.statusCode = 404;
                    res.end('Not Found');
                }
                return;
            }

            const middleware = this.middlewareArray[index];
            middleware.handleRequest(req, res, runMiddleware);
        };

        runMiddleware();
    }
}