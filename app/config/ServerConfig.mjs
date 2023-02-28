/**
 * Represents the configuration for the HTTP server.
 */
class ServerConfig {
    /**
     * Creates an instance of Config.
     * @param {Object} configObj - The configuration object loaded from a JSON file.
     *   * @param {Object<string, Function>} actionCallables - An object mapping action names to their corresponding callable functions.     */
    constructor(configObj, actionCallables) {
        this.server = configObj.endpoints.http.server;
        this.static = configObj.endpoints.http.static;
        this.backendServer = configObj.bindings.backend.server;
        this.boundActions = configObj.bindings.backend.boundActions;
        this.actions = configObj.endpoints.http.actions.map((action) => {
            const actionCallable = actionCallables[action.actionCallable];
            return {
                actionPath: action.actionPath,
                method: action.method,
                responseFile: action.responseFile,
                headers: action.headers || {},
                actionCallable
            };
        });
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
     * Gets the backend server configuration.
     * @returns {Object} The backend server configuration.
     */
    getBackendServerConfig() {
        return this.backendServer;
    }

    /**
     * Gets the bound actions configuration.
     * @returns {Object[]} The bound actions configuration.
     */
    getBoundActionsConfig() {
        return this.boundActions;
    }

    /**
     * Gets the actions' configuration.
     * @returns {Object[]} The actions configuration.
     */
    getActionsConfig() {
        return this.actions;
    }
}
