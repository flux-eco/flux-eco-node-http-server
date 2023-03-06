/**
 * @param request
 * @param {string[]} actionParameterNames
 * @return {object}
 */
export const extractParams = function(request, actionParameterNames) {
    if(!actionParameterNames) {
        return null;
    }
    const urlParts = request.url.split('/');
    const paramParts = urlParts.slice(1, urlParts.length - 1);
    const params = {};
    for (let i = 0; i < actionParameterNames.length; i++) {
        params[actionParameterNames[i]] = paramParts[i];
    }
    return params;
}