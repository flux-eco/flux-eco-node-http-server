import {getActionName} from "../handlers/getActionName.mjs";
import {extractParams} from "../handlers/extractParams.mjs";

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


    handleRequest(request, response, next) {
        const action = this.#actions[getActionName(request)];
        if (action) {
            try {
                // Call API handler function
                const result =  this.#handleActionCallable(getActionName(request), extractParams(request,action.params));
                // Return API result to client
                response.json(result);
            } catch (err) {
                // Send error response to client
                response.status(400).send(err.message);
            }
        } else {
            next();
        }
    }
}