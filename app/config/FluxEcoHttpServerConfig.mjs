/**
 * Represents the configuration for the flux-eco-http-server
 */
class FluxEcoHttpServerConfig {
    #server
    #policies
    #static
    #actions


    /**
     * Creates an instance of Config.
     * @param {Object} configObj - The configuration object loaded from a JSON file.
    **/
    constructor(configObj, actionCallables) {
        this.#server = configObj.endpoints.http.server;
        this.#policies = configObj.endpoints.http.policies;
        this.#static = configObj.endpoints.http.static;
        this.#actions = {};
        for (const [key, value] of Object.entries(configObj.endpoints.actions)) {
            this.actions[key] = {
                path: value.path,
                method: value.method,
                headers: value.headers || {},
                actionCallable: actionCallables[value.actionCallable]
            }
        }
    }

    get server() {
        return this.#server;
    }

    get policies() {
        return this.#policies;
    }

    get static() {
        return this.#static;
    }

    get actions() {
        return this.#actions;
    }
}
