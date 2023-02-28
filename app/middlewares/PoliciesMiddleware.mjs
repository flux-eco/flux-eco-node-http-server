class PoliciesMiddleware {
    handleRequest(request, response, next) {
        const policiesConfig = request.config.endpoints.http.policies;
        const policies = {};
        Object.keys(policiesConfig).forEach((key) => {
            const policy = policiesConfig[key];
            policies[key] = (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', policy.allowOrigin);
                res.setHeader('Access-Control-Allow-Headers', policy.allowHeaders);
                res.setHeader('Access-Control-Allow-Methods', policy.allowMethods);
                next();
            };
        });
        request.policies = policies;
        next();
    }
}