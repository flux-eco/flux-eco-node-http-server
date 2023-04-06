import {sendError} from "../handlers/sendError.mjs";

/**
 * An async function that handles API requests.
 * @typedef {Function} ApiRequestHandler
 * @param {string} actionName - The request object.
 * @param {object} requestParameter
 * @returns {Object} - The result of the API method.
 * @throws {Error} - If an unknown action is requested or if parameter validation fails.
 */
export class HttpRequestActionsMiddleware {
    /**
     * @var {Object}
     */
    #api

    #actions;

    /**
     * @param actions
     * @param {Object} api
     */
    constructor(actions, api) {
        this.#actions = actions;
        console.log("#actions")
        console.log(this.#actions)

        this.#api = api;

    }

    /**
     * @param {FluxEcoNodeHttpServerSettings} settings
     * @param {Object} api
     */
    static new(settings, api) {
        return new HttpRequestActionsMiddleware(settings.httpRequestActions, api)
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
                }

            } catch (err) {
                console.log(err);
                // Send error response to client
                sendError(response, 400);
            }
        }

        for (const actionName in this.#actions) {
            if (this.#actions.hasOwnProperty(actionName)) {
                const actionSchema = this.#actions[actionName];
                if (request.url.includes(actionName)) {
                    const handleActionParameters = {};
                    if(actionSchema.hasOwnProperty("parameters")) {
                        const parameters = actionSchema.parameters;
                        Object.entries(parameters).forEach(([parameterName, parameterSchema]) => {
                            if (request.url.includes(parameterName)) {
                                const url = request.url;
                                const urlParts = url.split("/");
                                urlParts.forEach((partValue, partPosition) => {
                                    if (partValue === parameterName) {

                                        if(parameterSchema.type === "object") {
                                            const urlObjectParameters =  urlParts[(partPosition + 1)];
                                            const keyValue = urlObjectParameters.split(":"); //todo more than one key-value-pair
                                            const keyValueObject = {};
                                            keyValueObject[keyValue[0]] = keyValue[1]
                                            handleActionParameters[parameterName] = keyValueObject
                                        } else {
                                            handleActionParameters[parameterName] = urlParts[(partPosition + 1)];
                                        }
                                    }
                                });
                            }
                        });
                    }

                    console.log(actionName);

                    await handleAction(actionName, handleActionParameters);
                }
            }
        }
        next();
    }
}