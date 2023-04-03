import fs from "node:fs";
import path from "node:path";
import {isPathInUrl} from "../handlers/isPathInUrl.mjs";
import {sendError} from "../handlers/sendError.mjs";

/** @typedef {import("node:http")} http */
export class FrontendFileMiddleware {
    /**
     * @property {Object.<string, Object.<string, FluxEcoBindingHttp.HttpStaticRoute>>} routes.static - Configuration for static routes.
     **/
    #filePaths;

    /**
     * @property {Object.<string, Object.<string, FluxEcoBindingHttp.HttpStaticRoute>>} routes.static - Configuration for static routes.
     */
    constructor(filePaths) {
        console.log(filePaths);
        this.#filePaths = filePaths;
    }

    /**
     * @param {FluxEcoNodeHttpServerConfig} config
     */
    static new(config) {
        return new FrontendFileMiddleware(config.schemas.filePathsSchema)
    }

    /**
     * @param {http.IncomingMessage} request
     * @param {http.ServerResponse} response
     * @param {() => void} next
     * @returns {Promise<void>}
     */
    async handleRequest(request, response, next) {

        let requestedPath = request.url;

        if (requestedPath === "/favicon.ico") {
            // this.#handleResponse(response, headers, "");
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
                if (!response.headersSent) {
                    this.#handleResponse(response, headers, fileContent);
                }
            }
        });
        const onError = (number) => {
            if (!response.headersSent) {
                sendError(response, number)
            }
        }

        for await (const [rootRelativeDirectoryName, staticRoutePathConfigurations] of Object.entries(this.#filePaths)) {
            //rootRelativeDirectoryName is not within the current requestedPath
            if (isPathInUrl(requestedPath, rootRelativeDirectoryName) === false) {
                continue;
            }

            const questionMarkIndex = requestedPath.indexOf('?');
            const requestedPathWithoutQueryParams = (questionMarkIndex === -1) ? requestedPath : requestedPath.substr(0, questionMarkIndex);

            //the file system path of the requested file
            const fileSystemFilePath = path.join(process.cwd(), "dom-handler/public", requestedPathWithoutQueryParams);

            //todo if...
            await this.#readFile(fileSystemFilePath, onRead(staticRoutePathConfigurations.contentType), onError);


            /**
             * @var {HttpStaticRouteConfiguration} staticRoutePathConfiguration
             */
            for await (const [staticRoutePath, staticRoutePathConfiguration] of Object.entries(staticRoutePathConfigurations)) {

                const regex = new RegExp(`^${rootRelativeDirectoryName}${staticRoutePath.replace(/\*\*/g,  '.*')}$`);
                //check regex
                if (regex.test(requestedPathWithoutQueryParams)) {
                    await this.#readFile(fileSystemFilePath, onRead(staticRoutePathConfiguration.contentType), onError);
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
