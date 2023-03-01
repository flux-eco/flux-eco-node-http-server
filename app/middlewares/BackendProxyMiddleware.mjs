class BackendProxyMiddleware {

    #backendServerUrl;
    #boundActions;

    constructor(backendServerUrl, boundActions) {
        this.backendServerUrl = backendServerUrl;
        this.boundActions = boundActions;
    }

    /**
     * @param {FluxEcoHttpServerConfig} config
     */
    static new(config) {
        return new BackendProxyMiddleware(config.actions)
    }


    handleRequest(req, res, next) {
        const urlParts = req.url.split('/');
        const actionPath = urlParts[urlParts.length - 1];

        // Find API endpoint for the requested action path
        const boundAction = this.boundActions.find((ba) => ba.path === actionPath);
        if (!boundAction) {
            // Pass on to next middleware
            next();
            return;
        }

        const backendUrl = url.resolve(this.backendServerUrl, boundAction.targetPath);
        const backendReq = http.request(backendUrl, (backendRes) => {
            res.writeHead(backendRes.statusCode, backendRes.headers);
            backendRes.pipe(res);
        });

        backendReq.on('error', (err) => {
            console.error(`Error proxying request: ${err.message}`);
            next(err);
        });

        req.pipe(backendReq);
    }
}