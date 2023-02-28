/**
 * Represents the configuration for the flux-eco-http-server
 */
class FluxEcoHttpServerConfig {
    /**
     * Creates an instance of Config.
     * @param {Object} configObj - The configuration object loaded from a JSON file.
     * @param {Object<string, Function>} actionCallables - An object mapping action names to their corresponding callable functions.
     **/
    constructor(configObj, actionCallables) {
        this.server = configObj.endpoints.http.server;
        this.static = configObj.endpoints.http.static;
        this.actions = {};
        for (const [key, value] of Object.entries(configObj.endpoints.actions)) {
            this.actions[key] = {
                actionPath: value.actionPath,
                method: value.method,
                responseFile: value.responseFile,
                headers: value.headers || {},
                actionType: actionCallables[value.actionCallable]
            }
        }
    }

    /**
     * Gets the server configuration.
     * @returns {Object} The server configuration.
     */
    getServerConfig() {
        return this.server;
    }

    /**
     * Gets the static endpoint configuration.
     * @returns {Object} The static endpoint configuration.
     */
    getStaticConfig() {
        return this.static;
    }

    /**
     * Gets the actions' configuration.
     * @returns {Object[]} The actions configuration.
     */
    getActionsConfig() {
        return this.actions;
    }
}
