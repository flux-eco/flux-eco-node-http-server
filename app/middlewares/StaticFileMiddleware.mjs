import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import url from "node:url";
import {isPathInUrl} from "../handlers/isPathInUrl.mjs";

/** @typedef {import("node:http")} http */

export class StaticFileMiddleware {
    /**
     * @type {object}
     */
    #staticFiles;

    /**
     * @param {object} staticFiles
     */
    constructor(staticFiles) {
        this.#staticFiles = staticFiles;
    }

    /**
     * @param {FluxEcoHttpServerConfig} config
     */
    static new(config) {
        return new StaticFileMiddleware(config.staticFiles)
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
            console.error(`Invalid path name: ${pathname}`);
            next();
            return;
        }

        if(isPathInUrl(request.url, this.#staticFiles.path) === false) {
            next();
            return;
        }

        const filePath = path.join(this.#staticFiles.path, pathname);

        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
        } catch (err) {
            console.error(`Error accessing file: ${filePath}`, err);
            next();
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
