import {sendError} from "../handlers/sendError.mjs";

/**
 * An async function that handles API requests.
 * @typedef {Function} ApiRequestHandler
 * @param {string} actionName - The request object.
 * @param {object} requestParameter
 * @returns {Object} - The result of the API method.
 * @throws {Error} - If an unknown action is requested or if parameter validation fails.
 */
export class BackendActionsMiddleware {
    /**
     * @var {Object}
     */
    #api

    #apiActions

    #actions;

    /**
     * @param actions
     * @param {Object} api
     */
    constructor(actions, api) {
        this.#api = api;
        this.#actions = actions;
    }

    /**
     * @param {FluxEcoNodeHttpServerConfig} serverConfig
     * @param {Object} api
     */
    static new(serverConfig, api) {
        return new BackendActionsMiddleware(serverConfig.schemas.actionsSchema, api)
    }

    async handleRequest(request, response, next) {


        const handleAction = async (actionName, actionParameters) => {
            try {
                let result = {};
                result = await this.#api[actionName](actionParameters);

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

        console.log(this.#actions);

        for (const actionName in this.#actions) {
            if (this.#actions.hasOwnProperty(actionName)) {
                const actionDefinition = this.#actions[actionName];

                if (request.url.includes(actionName)) {
                    console.log(actionDefinition);
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
                    });
                    await handleAction(actionName, handleActionParameters);
                }
            }
        }
    }
}