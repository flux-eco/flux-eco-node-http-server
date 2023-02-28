# flux-eco-http-server

flux-eco-http-server is a customizable HTTP server designed for use in flux-eco applications. It allows you to easily create HTTP endpoints and manage incoming requests with middleware.


## Installation
flux-eco-http-server Server is available as on github.

## Usage

Here is an example of how to create a new HTTP server:

``` javascript
const { HttpServer, MiddlewareChain } = require('flux-eco-http-server');
const config = require('./config.json');
const middlewareClasses = require('./middlewares');

const middlewareChain = await MiddlewareChain.new(middlewareClasses, config);
const server = await FluxEcoHttpServer.new(config, middlewareChain);

server.start();
```

In this example, we first **create a new MiddlewareChain** object using an array of middleware classes and a configuration object. We then pass this middleware chain and the configuration object to a new HttpServer object, which we then start.

## Configuration

The HTTP server is configured using a configuration object, which is loaded from a JSON file. The configuration object must conform to the following JSON schema:

```
<JSON schema>
```

### Endpoints
The **endpoints** property of the configuration object is an object that defines the HTTP endpoints that the server will expose. Currently, the only supported endpoint is http. The http endpoint is defined by an object with the following properties:
- **server**: An object that defines the server configuration, including the port and host to listen on. 
- **policies**: An object that defines the policies for the server, including the allowedHeaders and allowedIps.
- **static**: An object that defines a static endpoint for serving static files.
- **actions**: An array of objects that define API endpoints for handling incoming requests.

### Bindings
The **bindings** property of the configuration object is an object that defines the bindings between the server and other components in the Flux Eco application. Currently, the only supported binding is **backend**. The **backend** binding is defined by an object with the following properties:
- **server**: An object that defines the backend server configuration, including the port and host to connect to.
- **boundActions**: An array of objects that define the API endpoints on the backend server that the HTTP server will proxy requests to.

## Middleware

**flux-eco-http-server** provides built-in middleware functions for processing HTTP requests and responses. Middleware functions are executed in order, allowing developers to easily add new functionality to the server.

### ServerMiddleware

Handles HTTP requests at the server level. This middleware function is responsible for listening for incoming HTTP requests and passing them along to the appropriate middleware functions.
### ErrorHandlingMiddleware

Handles errors that occur during request processing. This middleware function is responsible for catching errors and sending an appropriate error response to the client.
### LoggingMiddleware

Logs incoming HTTP requests and outgoing HTTP responses. This middleware function is responsible for logging details about each request and response.
### PoliciesMiddleware

Applies configurable policies to incoming HTTP requests. This middleware function is responsible for enforcing access control and security policies.
### StaticFileMiddleware

Serves static files to clients. This middleware function is responsible for serving files from the specified directory.
### ActionMiddleware

Handles incoming API requests. This middleware function is responsible for mapping incoming requests to specific API actions and executing them.
### BackendProxyMiddleware

Forwards incoming API requests to a backend server. This middleware function is responsible for forwarding incoming requests to a backend server and returning the response to the client.

## License

flux-eco-http-server is licensed under the GPL-3.0 License. See the LICENSE file for details.
