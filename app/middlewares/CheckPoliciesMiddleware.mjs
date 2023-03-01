import {getActionName} from "../handlers/getActionName.mjs";
import {requiredHeadersAreSet} from "../handlers/requiredHeadersAreSet.mjs";
import {isClientIpAddressAllowed} from "../handlers/isClientIpAddressAllowed.mjs";
import {sendError} from "../handlers/sendError.mjs";

class CheckPoliciesMiddleware {
    /**
     * @type {object}
     */
    #policiesConfig;
    #actionsConfig;
    #handlers;

    /**
     * @param {object} policiesConfig
     * @param {object} actionsConfig
     */
    constructor(policiesConfig, actionsConfig) {
        this.#policiesConfig = policiesConfig;
        this.#actionsConfig = actionsConfig;
        this.#handlers = {};
        this.#handlers.requiredHeaders = requiredHeadersAreSet;
        this.#handlers.allowedIps = isClientIpAddressAllowed;
    }

    /**
     * @param {FluxEcoHttpServerConfig} config
     */
    static new(config) {
        return new CheckPoliciesMiddleware(config.policies, config.actions)
    }

    handleRequest(request, response, next) {
        const actionConfig = this.#actionsConfig[getActionName(request)];

        if(actionConfig.policies.isArray) {
            actionConfig.policies.isArray.forEach((policyName) => {
                const policy = this.#policiesConfig[policyName];
                const result = this.#handlers[policyName](request, policy)

                if(result === false) {
                    sendError(res, 401)
                }
            });
        }

        /*
                res.setHeader('Access-Control-Allow-Origin', policy.allowOrigin);
                res.setHeader('Access-Control-Allow-Headers', policy.allowHeaders);
                res.setHeader('Access-Control-Allow-Methods', policy.allowMethods);
                next();
        */
        next();
    }
}