import {getActionName} from "../handlers/getActionName.mjs";
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
    #actions;
    /**
     * @var {ApiRequestHandler}
     */
    #handleActionCallable

    /**
     * @param {object} actions
     * @param {ApiRequestHandler} handleActionCallable
     */
    constructor(actions, handleActionCallable) {
        this.#actions = actions;
        this.#handleActionCallable = handleActionCallable;
    }

    /**
     * @param {FluxEcoHttpServerConfig} serverConfig
     * @param {ApiRequestHandler} handleActionCallable
     */
    static new(serverConfig, handleActionCallable) {
        return new ActionsMiddleware(serverConfig.actions, handleActionCallable)
    }


    async handleRequest(request, response, next) {
        const action = this.#actions[getActionName(request)];
        if (action) {
            try {
                const result =  await this.#handleActionCallable(getActionName(request), extractParams(request,action.params));
                if(result) {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.write(JSON.stringify(result));
                    response.end();
                }

            } catch (err) {
                console.log(err);
                // Send error response to client
                sendError(response, 400);
            }
        } else {
            next();
        }
    }
}