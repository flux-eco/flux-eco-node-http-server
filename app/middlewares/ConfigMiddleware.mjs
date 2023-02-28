class ConfigMiddleware {
    handleRequest(request, response, next) {
        const config = fs.readFileSync('config.json', 'utf8');
        const parsedConfig = JSON.parse(config);
        request.config = parsedConfig;
        next();
    }
}