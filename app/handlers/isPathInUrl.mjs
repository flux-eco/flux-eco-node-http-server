export const isPathInUrl = function isPathInUrl(requestUrl, path) {
    try {
        return requestUrl.startsWith(path);
    } catch (error) {
        console.log(error)
    }
    return false
}
