/**
 * @param {string} clientIp
 * @param {array} allowedIps - e.g [192.168.1.1, 192.168.1.2]
 * @return {boolean}
 */
export const isClientIpAddressAllowed = function (clientIp, allowedIps) {
    if (allowedIps.length === 0) {
        return false;
    }
    return allowedIps.includes(clientIp);
};