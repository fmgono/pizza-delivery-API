/*
 * Primary file for the API
 *
 * */
const hostName = 'localhost';
const port = 3000;

const server = require('./controller');

// Start the server
server.listen(port,() => console.log(`Server running at http://${hostName}:${port}/`));