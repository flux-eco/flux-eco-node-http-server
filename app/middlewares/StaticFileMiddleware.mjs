class StaticFileMiddleware {
    constructor(staticPath) {
        this.staticPath = staticPath;
    }

    handleRequest(req, res, next) {
        const { pathname } = url.parse(req.url);
        const sanitizedPathname = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
        const filePath = path.join(this.staticPath, sanitizedPathname);

        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                // File not found, pass on to next middleware
                next();
                return;
            }

            const fileStream = fs.createReadStream(filePath);
            pipeline(fileStream, res, (err) => {
              if (err) {
                console.error(`Error reading file: ${filePath}`, err);
                res.statusCode = 500;
                res.end();
              }
            });
        });
    }
}
