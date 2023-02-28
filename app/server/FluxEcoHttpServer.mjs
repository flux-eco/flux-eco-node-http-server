const http = require('http');

/**
 * Represents the HTTP server.
 */
export class FluxEcoHttpServer {

    constructor(config, middlewareChain) {
        /**
         * The server configuration object.
         * @type {Config}
         */
        this.config = config;

        /**
         * The middleware chain to use for processing HTTP requests.
         * @type {MiddlewareChain}
         */
        this.middlewareChain = middlewareChain;

        /**
         * The HTTP server instance.
         * @type {http.Server}
         */
        this.httpServer = http.createServer(this.handleRequest.bind(this));
    }

    /**
     * Creates an instance of HttpServer.
     * @param {Config} config - The server configuration object.
     * @param {MiddlewareChain} middlewareChain - The middleware chain to use for processing HTTP requests.
     * @return FluxEcoHttpServer
     */
    static async new(config, middlewareChain) {
        return new FluxEcoHttpServer(config, middlewareChain)
    }

    /**
     * Handles an incoming HTTP request.
     * @param {http.IncomingMessage} req - The incoming HTTP request object.
     * @param {http.ServerResponse} res - The HTTP response object to send the response through.
     */
    handleRequest(req, res) {
        this.middlewareChain.handleRequest(req, res);
    }

    /**
     * Starts the HTTP server.
     * @returns {void}
     */
    start() {
        const {port, host} = this.config;

        // Start the server listening on the specified port and host
        this.httpServer.listen(port, host, () => {
            console.log(`Server running at http://${host}:${port}/`);
        });
    }

    /**
     * Stops the HTTP server.
     * @returns {void}
     */
    stop() {
        this.httpServer.close();
        console.log('Server stopped');
    }
}