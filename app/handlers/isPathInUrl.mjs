function isPathInUrl(requestUrl, path) {
    const url = new URL(requestUrl);
    return url.pathname.startsWith(path);
}
