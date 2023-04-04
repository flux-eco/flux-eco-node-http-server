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

    #apiActions

    #actionsSchema;

    /**
     * @param actions
     * @param {Object} api
     */
    constructor(actions, api) {
        this.#actionsSchema = actions;
        console.log("#actionsSchema")
        console.log(this.#actionsSchema)

        this.#api = api;

    }

    /**
     * @param {FluxEcoNodeHttpServerConfig} serverConfig
     * @param {Object} api
     */
    static new(serverConfig, api) {
        console.log("server config");
        console.log(serverConfig)
        return new HttpRequestActionsMiddleware(serverConfig.schemas.actionsSchema, api)
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

        for (const actionName in this.#actionsSchema) {
            if (this.#actionsSchema.hasOwnProperty(actionName)) {
                const actionSchema = this.#actionsSchema[actionName];
                if (request.url.includes(actionName)) {

                    console.log("handle action with name...")
                    console.log(actionName)
                    console.log("with schema")
                    console.log( this.#actionsSchema)

                    const handleActionParameters = {};
                    const parameters = actionSchema.parameters;
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
        next();
    }
}