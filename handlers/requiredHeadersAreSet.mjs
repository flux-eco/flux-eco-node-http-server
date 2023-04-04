export const requiredHeadersAreSet = function (request, requiredHeaders) {
    const requestHeaders = request.headers;
    for (let header of requiredHeaders) {
        if (!requestHeaders[header]) {
            return false;
        }
    }
    return true;
};