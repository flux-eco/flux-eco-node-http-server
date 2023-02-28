class ServerMiddleware {
    handleRequest(request, response, next) {
        const serverConfig = request.config.endpoints.http.server;
        const server = {
            host: serverConfig.host || 'localhost',
            port: serverConfig.port || 8080
        };
        request.server = server;
        next();
    }
}