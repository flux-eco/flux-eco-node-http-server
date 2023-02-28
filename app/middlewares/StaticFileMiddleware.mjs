class StaticFileMiddleware {
    constructor(staticPath) {
        this.staticPath = staticPath;
    }

    handleRequest(req, res, next) {
        const { pathname } = url.parse(req.url);
        const filePath = path.join(this.staticPath, pathname);

        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                // File not found, pass on to next middleware
                next();
                return;
            }

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        });
    }
}
