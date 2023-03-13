import {extractParams} from "../handlers/extractParams.mjs";
import {sendError} from "../handlers/sendError.mjs";

/**
 * An async function that handles API requests.
 * @typedef {Function} ApiRequestHandler
 * @param {string} actionName - The request object.
 * @param {object} requestParameter
 * @returns {Object} - The result of the API method.
 * @throws {Error} - If an unknown action is requested or if parameter validation fails.
 */


export class ActionsMiddleware {
    /**
     * @var {object}
     */
    #apiRoutes;
    /**
     * @var {Object}
     */
    #api

    /**
     * @param {object} apiRoutes
     * @param {Object} api
     */
    constructor(apiRoutes, api) {
        this.#apiRoutes = apiRoutes;
        this.#api = api;
    }

    /**
     * @param {FluxEcoHttpServerConfig} serverConfig
     * @param {Object} api
     */
    static new(serverConfig, api) {
        return new ActionsMiddleware(serverConfig.routes.api, api)
    }

    async handleRequest(request, response, next) {
        let action = this.#apiRoutes[request.url];

        let parameterValues = [];

        if (action === undefined) {
            for (const [route, routeConfig] of Object.entries(this.#apiRoutes)) {
                const url = request.url;
                const urlParts = url.split("/");

                if(routeConfig.hasOwnProperty("parameterNames") === false ) {
                    const actionName = urlParts[urlParts.length - 1];
                    if(actionName === routeConfig.actionName) {
                        action = routeConfig;
                        break;
                    }
                    continue;
                }
                const parameterNames = routeConfig.parameterNames;
                const parameterCount = parameterNames.length;


                if (urlParts.length === parameterCount + 3) {
                    let endsWithMatch = true;

                    for (let i = 0; i < parameterCount; i++) {
                        parameterValues.push(urlParts[i + 2]);
                    }

                    const endsWith = routeConfig.actionName;

                    if (!url.endsWith(endsWith)) {
                        endsWithMatch = false;
                    }

                    if (endsWithMatch) {
                        action = routeConfig;
                        break;
                    }
                }
            }
        }

        if (action) {
            try {
                let result ={};
                if(action.actionType === "requestHandler") {
                    result = await this.#api[action.actionName](request.url, request);
                } else {
                    result = await this.#api[action.actionName](...parameterValues);
                }
                if (result) {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.write(JSON.stringify(result));
                    response.end();
                    return;
                }
            } catch (err) {
                console.log(err);
                // Send error response to client
                sendError(response, 400);
            }
        } else {
           return;
        }
    }
}