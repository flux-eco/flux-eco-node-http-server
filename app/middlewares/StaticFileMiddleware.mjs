import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import url from "node:url";
import {isPathInUrl} from "../handlers/isPathInUrl.mjs";
import {sendError} from "../handlers/sendError.mjs";

/** @typedef {import("node:http")} http */

export class StaticFileMiddleware {
    /**
     * @type {string}
     */
    #staticFilesPath;

    /**
     * @type {Object.<string,FluxEcoBindingHttp.HttpStaticRoute>}
     */
    #staticRoutes;

    constructor(staticFilesPath, staticRoutes) {
        this.#staticFilesPath = staticFilesPath;
        this.#staticRoutes = staticRoutes;
    }

    /**
     * @param {FluxEcoHttpServerConfig} config
     */
    static new(config) {
        return new StaticFileMiddleware(config.staticFilesPath, config.routes.static)
    }

    /**
     * @param {http.IncomingMessage} request
     * @param {http.ServerResponse} response
     * @param {() => void} next
     * @returns {Promise<void>}
     */
    async handleRequest(request, response, next) {
        const { pathname } = url.parse(request.url);


        if (pathname.includes("..") || pathname.includes("//") || pathname.includes("\\")) {
            sendError(response, 403)
            return;
        }

        if(isPathInUrl(pathname, this.#staticFilesPath) === false) {
            next();
            return;
        }

        const filePath = path.join(process.cwd(), pathname);

        let routeConfig = this.#staticRoutes[path.join(this.#staticFilesPath,pathname)];

        if(routeConfig === undefined) {
            for (const route in this.#staticRoutes) {
                const regex = new RegExp(`^/public${route.replace(/\*\*/g, '.*')}$`);
                if (regex.test(pathname)) {
                    routeConfig = this.#staticRoutes[route];
                }
            }
        }
        if(routeConfig === undefined) {
            next();
            return;
        }

        response.setHeader('Content-Type', routeConfig.contentType);

        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
        } catch (err) {
            sendError(response, 403)
            return;
        }

        try {
            await stream.promises.pipeline(fs.createReadStream(filePath), response);
        } catch (err) {
            console.error(`Error reading file: ${filePath}`, err);
            if (!response.headersSent) {
                response.statusCode = 500;
                response.statusMessage = "";
            }
        } finally {
            response.end();
        }
    }
}
