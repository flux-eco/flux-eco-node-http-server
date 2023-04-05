import fs from "node:fs";
import path from "node:path";
import {isPathInUrl} from "../handlers/isPathInUrl.mjs";
import {sendError} from "../handlers/sendError.mjs";

/** @typedef {import("node:http")} http */
export class DomFilePathsMiddleware {
    /**
     * @property {FluxEcoFilePathsSchema} filePathsSchema
     **/
    #filePathsSchema;

    /**
     * @property {FluxEcoFilePathsSchema} filePathsSchema
     */
    constructor(filePathsSchema) {
        this.#filePathsSchema = filePathsSchema;
    }

    /**
     * @param {FluxEcoNodeHttpServerConfig} config
     */
    static new(config) {
        return new DomFilePathsMiddleware(config.schemas.filePathsSchema)
    }

    /**
     * @param {http.IncomingMessage} request
     * @param {http.ServerResponse} response
     * @param {() => void} next
     * @returns {Promise<void>}
     */
    async handleRequest(request, response, next) {
        let requestedPath = request.url;
        console.log(request.url);
        if (requestedPath === "/favicon.ico") {
            sendError(response, 404)
            return;
        }

        if (requestedPath.includes("..") || requestedPath.includes("//") || requestedPath.includes("\\")) {
            sendError(response, 403)
            return;
        }

        const onRead = await ((headers) => {
            /**
             * @var {Buffer} fileContent
             */
            return (fileContent) => {
                //if (!response.headersSent) {
                this.#handleResponse(response, headers, fileContent);
                //}
            }
        });
        const onError = (number) => {
            if (!response.headersSent) {
                sendError(response, number)
            }
        }

        for await (const [schemaPath, filePathSchema] of Object.entries(this.#filePathsSchema)) {
            //path is not within the current requestedPath
            if (isPathInUrl(requestedPath, schemaPath) === false) {
                continue;
            }

            const questionMarkIndex = requestedPath.indexOf('?');
            const requestedPathWithoutQueryParams = (questionMarkIndex === -1) ? requestedPath : requestedPath.substring(0, questionMarkIndex);

            switch (filePathSchema.pathType) {
                case "file": {
                    const fileSystemFilePath = path.join(process.cwd(), "dom-handler/public", requestedPathWithoutQueryParams);
                    await this.#readFile(fileSystemFilePath, onRead(filePathSchema.contentType), onError);
                    return;
                }
            }
        }
        next();
    }


    /**
     *
     * @param fileSystemFilePath
     * @param {function(string)} onRead
     * @param {function(number)} onError
     * @return {Promise<void>}
     */
    async #readFile(fileSystemFilePath, onRead, onError) {
        try {
            await fs.promises.access(fileSystemFilePath, fs.constants.R_OK);
        } catch (err) {
            console.log(err);
            onError(403)
        }
        try {
            const fileContent = await fs.promises.readFile(fileSystemFilePath);
            const contentAsString = fileContent.toString();
            onRead(contentAsString);
        } catch (err) {
            console.error(`Error reading file: ${fileSystemFilePath}`, err);
            onError(500)
        }
    }

    /**
     *
     * @param {http.ServerResponse} response
     * @param {string} contentType
     * @param {string} content
     * @return {Promise<void>}
     */
    async #handleResponse(response, contentType, content) {
        response.setHeader("Content-Type", contentType);
        response.setHeader("Content-Length", content.length);
        response.end(content)
    }
}
