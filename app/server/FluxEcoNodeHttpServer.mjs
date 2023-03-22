import http from "http";
import {MiddlewareChain} from "../middlewares/MiddlewareChain.mjs";
import {CheckPoliciesMiddleware} from "../middlewares/CheckPoliciesMiddleware.mjs";
import {ActionsMiddleware} from "../middlewares/ActionsMiddleware.mjs";
import {StaticFileMiddleware} from "../middlewares/StaticFileMiddleware.mjs";

/**
 * Represents the HTTP server.
 */
export class FluxEcoNodeHttpServer {

    constructor(config, middlewareChain) {
        /**
         * The server configuration object.
         * @type {HttpServerConfig}
         */
        this.config = this.resolveEnvVariables(config);

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
     * Creates an instance of HttpServer.     *
     * @param {FluxEcoHttpServerConfig} config - The server configuration object.
     * @param {Object|null} api
     * @return FluxEcoNodeHttpServer
     */
    static async new(config, api) {
        return new FluxEcoNodeHttpServer(
            config,
            await MiddlewareChain.new(
                [
                    await CheckPoliciesMiddleware.new(config),
                    await StaticFileMiddleware.new(config),
                    await ActionsMiddleware.new(config, api)
                ]
            )
        )
    }

    /**
     * Handles an incoming HTTP request.
     * @param {http.IncomingMessage} request - The incoming HTTP request object.
     * @param {http.ServerResponse} response - The HTTP response object to send the response through.
     */
    async handleRequest(request, response) {
        await this.middlewareChain.handleRequest(request, response);
    }

    /**
     * Starts the HTTP server.
     * @returns {void}
     */
    start() {
        const port = this.config.server.port;
        const host = this.config.server.host;

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

    resolveEnvVariables(object) {
        if (object === null) {
            return object;
        }
        if (typeof object !== 'object') {
            return object;
        }
        const resolved = Array.isArray(object) ? [] : {};
        for (const [key, value] of Object.entries(object)) {
            if (typeof value === 'string' && value.startsWith('$')) {
                const envVar = value.slice(1);
                const envVarName = envVar.replace(/[{}]/g, '');
                resolved[key] = process.env[envVarName];
            } else {
                resolved[key] = this.resolveEnvVariables(value);
            }
        }
        return resolved;
    }
}