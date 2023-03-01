import {getActionName} from "../handlers/getActionName.mjs";

class ActionsMiddleware {
    /**
     * @var {object}
     */
    #actions;
    /**
     * @var {Object<string, Function>}
     */
    #actionCallables

    /**
     * @param {object} actions
     * @param {Object<string, Function>} actionCallables - An object mapping action names to their corresponding callable functions.
     */
    constructor(actions, actionCallables) {
        this.#actions = actions;
        this.#actionCallables = actionCallables;
    }

    /**
     * @param {FluxEcoHttpServerConfig.actions} actions
     * @param {Object<string, Function>} actionCallables - An object mapping action names to their corresponding callable functions.
     */
    static new(actions, actionCallables) {
        return new ActionsMiddleware(actions, actionCallables)
    }


    handleRequest(request, response, next) {
        const action = this.#actions[getActionName(request)];
        if (action) {
            const handler = this.#actionCallables[getActionName(request)];
            handler(request, response);
        } else {
            next();
        }
    }
}