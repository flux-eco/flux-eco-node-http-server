import {sendError} from "../handlers/sendError.mjs";

export class MiddlewareChain {
    /**
     * @private
     * @param middlewares
     */
    constructor(middlewares = []) {
        this.middlewares = middlewares;
    }

    static async new(middlewares = []) {
        return new MiddlewareChain(middlewares);
    }

    handleRequest(request, response) {
        let currentHandlerIndex = -1;
        const next = () => {
            currentHandlerIndex++;
            if (currentHandlerIndex >= this.middlewares.length) {
                if (!response.headersSent) {
                    sendError(response, 404);
                }
                return;
            }
            if (!response.headersSent) {
                return this.middlewares[currentHandlerIndex].handleRequest(request, response, next.bind(this));
            }
        };
        return next();
    }
}