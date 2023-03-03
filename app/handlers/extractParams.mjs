/**
 * @param request
 * @param {string[]} actionParams
 * @return {object}
 */
export const extractParams = function(request, actionParams) {
    if(!actionParams) {
        return null;
    }
    const urlParts = request.url.split('/');
    const paramParts = urlParts.slice(1, urlParts.length - 1);
    const params = {};
    for (let i = 0; i < actionParams.length; i++) {
        params[actionParams[i]] = paramParts[i];
    }
    return params;
}