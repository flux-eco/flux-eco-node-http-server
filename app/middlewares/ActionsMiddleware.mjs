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

    #apiActions

    #actions;

    /**
     * @param {object} apiRoutes
     * @param actions
     * @param {Object} api
     */
    constructor(apiRoutes, actions, api) {
        this.#apiRoutes = apiRoutes;
        this.#api = api;
        this.#actions = actions;
    }

    /**
     * @param {FluxEcoHttpServerConfig} serverConfig
     * @param {Object} api
     */
    static new(serverConfig, api) {
        return new ActionsMiddleware(serverConfig.routes.api, serverConfig.actions, api)
    }

    async handleRequest(request, response, next) {
        const handleAction = async (actionType, actionName, actionParameters) => {
            try {
                let result = {};
                if (actionType === "requestHandler") {
                    result = await this.#api[actionName](request.url, request);
                } else {
                    result = await this.#api[actionName](actionParameters);
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
        }

        this.#actions.forEach(actionDefinition => {
            if (request.url.includes(actionDefinition.actionName)) {
                const action = actionDefinition;
                const handleActionParameters = {};
                const parameters = action.parameters;
                Object.entries(parameters).forEach(([parameterName, parameterSchema]) => {
                    if (request.url.includes(parameterName)) {
                        const url = request.url;
                        const urlParts = url.split("/");
                        urlParts.forEach((partValue, partPosition) => {
                            if (partValue === parameterName) {
                                handleActionParameters[parameterName] = urlParts[(partPosition + 1)];
                            }
                        });
                    }
                })
                handleAction("", action.actionName, handleActionParameters);
            }
        });
    }
}