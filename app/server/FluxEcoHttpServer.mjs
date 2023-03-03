/**
 * @typedef {Object} HttpServerConfig
 * @property {Object} server - Konfiguration für den HTTP-Server
 * @property {string} server.port - Der Port, auf dem der Server hören soll
 * @property {string} server.host - Die IP-Adresse oder Hostname, auf dem der Server ausgeführt werden soll
 * @property {Object.<string, {policy: {path: string, requiredHeaders: string, allowedHeaders: string, allowedIps: string}}>} policies - Konfiguration der Zugriffspolitik
 * @property {Object.<string, {path: string}>} staticFiles - Konfiguration der statischen Dateien
 * @property {Object.<string, {action: {name: string, path: string, method: "GET"|"POST"|"PUT"|"DELETE"}}>} actions - Konfiguration der Aktionen
 */


import { createServer as createServerHttp } from "node:http";
import http from "http";

/**
 * Represents the HTTP server.
 */
export class FluxEcoHttpServer {

    constructor(config, middlewareChain) {
        /**
         * The server configuration object.
         * @type {HttpServerConfig}
         */
        this.config = config;

        /**
         * The middleware chain to use for processing HTTP requests.
         * @type {MiddlewareChain}
         */
        this.middlewareChain = middlewareChain

        /**
         * The HTTP server instance.
         * @type {http.Server}
         */
        this.httpServer =  http.createServer(this.handleRequest.bind(this));
    }

    /**
     * Creates an instance of HttpServer.     *
     * @param {HttpServerConfig} config - The server configuration object.
     * @param {MiddlewareChain} middlewareChain
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
        console.log(this.config)
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
}
