/**
 * @param request
 * @return {string}
 */
export const getActionName = function(request) {
    const pathFragments = request.url.split('/');
    return pathFragments[pathFragments.length - 1];
};