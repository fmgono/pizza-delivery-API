// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const router = require('./routes/index');
const helpers = require('./lib/helpers');

// Initialize function for callback.
const server = (req, res) => {
    // Get the HTTP Method & headers from the request.
    let {method, headers} = req;
    method = req.method.toLowerCase();

    // Get the the path, query from url that has parsed.
    let {pathname:path, query} = url.parse(req.url, true);
    path = path.replace(/^\/+|\/+$/g,'');

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', data => buffer += decoder.write(data));
    req.on('end', () => {
        buffer += decoder.end();

        // Construct the data object to send to the handler.
        const data = {
            path,
            query,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Choose selected endpoint / routes / path.
        const selectedRoutes = router.hasOwnProperty(path) ? router[path] :router.notFound;

        selectedRoutes(data, (statusCode, payload) => {
            // Use the payload called back by the handler or default to empty object.
            payload = payload ? payload : {};

            // Convert the payload to a string
            payload = JSON.stringify(payload);

            // Return the response.
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payload);
        });

        console.log(`Path: ${path}\nMethod: ${method}\nQuery: `, query);
        console.log(`Request received with this payload : ${buffer}`);

    });

};

// Create the server
module.exports = http.createServer((req,res) => server(req,res));