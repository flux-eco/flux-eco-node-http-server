import {getActionName} from "../handlers/getActionName.mjs";
import {requiredHeadersAreSet} from "../handlers/requiredHeadersAreSet.mjs";
import {isClientIpAddressAllowed} from "../handlers/isClientIpAddressAllowed.mjs";
import {sendError} from "../handlers/sendError.mjs";

export class CheckPoliciesMiddleware {
    /**
     * @type {object}
     */
    #policies;
    #handlers;

    /**
     * @param {object} policies
     */
    constructor(policies) {
        this.#policies = policies;
        this.#handlers = {};
        this.#handlers.requiredHeaders = requiredHeadersAreSet;
        this.#handlers.allowedIps = isClientIpAddressAllowed;
    }

    /**
     * @param {FluxEcoHttpServerConfig} config
     */
    static new(config) {
        return new CheckPoliciesMiddleware(config.policies)
    }

    handleRequest(request, response, next) {

        Object.entries(this.#policies).forEach(([policyName, policy]) => {
            if (isPathInUrl(request.url, policy.path)) {
                Object.entries(this.#handlers).forEach(([policyRuleName, handler]) => {
                    if (policy.constructor.hasOwnProperty(policyRuleName)) {
                        const result = handler(request, policy[policyRuleName]);
                        if (result === false) {
                            sendError(401)
                        }
                    }
                })
            }
        });

        next();
    }
}