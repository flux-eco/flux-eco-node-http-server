class ActionsMiddleware {
    handleRequest(request, response, next) {
        const actionsConfig = request.config.endpoints.http.actions;
        const actionPath = request.url.split('/').slice(-1)[0];
        const action = actionsConfig[actionPath];
        if (action) {
            const handler = action.handler;
            const policy = action.policy;
            if (policy && request.policies[policy]) {
                request.policies[policy](request, response);
            } else {
                handler(request, response);
            }
        } else {
            next();
        }
    }
}