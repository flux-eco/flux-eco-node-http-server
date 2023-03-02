import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import url from "node:url";

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
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @param {() => void} next
     * @returns {Promise<void>}
     */
    async handleRequest(req, res, next) {
        const { pathname } = url.parse(req.url);

        if (pathname.includes("..") || pathname.includes("//") || path.includes("\\")) {
            console.error(`Invalid path name: ${pathname}`);
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
            await stream.promises.pipeline(fs.createReadStream(filePath), res);
        } catch (err) {
            console.error(`Error reading file: ${filePath}`, err);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.statusMessage = "";
            }
        } finally {
            res.end();
        }
    }
}
