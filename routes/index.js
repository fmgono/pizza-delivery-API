// Import routes
const users = require('./users');
const tokens = require('./tokens');

const routes = {
    notFound(data,callback) {
        callback(404,{Error: 'End point not found!'});
    },
    users,
    tokens
};

module.exports = routes;