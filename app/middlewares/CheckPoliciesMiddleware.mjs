import {getActionName} from "../handlers/getActionName.mjs";
import {requiredHeadersAreSet} from "../handlers/requiredHeadersAreSet.mjs";
import {isClientIpAddressAllowed} from "../handlers/isClientIpAddressAllowed.mjs";
import {sendError} from "../handlers/sendError.mjs";
import {isPathInUrl} from "../handlers/isPathInUrl.mjs";

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
        try {
            Object.entries(this.#policies).forEach(([policyName, policy]) => {
                if (isPathInUrl(request.url, policy.path)) {
                    Object.entries(this.#handlers).forEach(([policyRuleName, handler]) => {
                        const result = handler(request, policy[policyRuleName]);
                        if (result === false) {
                            sendError(response, 401)
                            return;
                        }
                    })
                }
            });
            next();
        } catch (error) {
            sendError(response, 401)
            return;
        }
    }
}