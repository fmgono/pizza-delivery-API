// Import routes
const users = require('./users');
const tokens = require('./tokens');
const menus = require('./menus');

const routes = {
    notFound(data,callback) {
        callback(404,{Error: 'End point not found!'});
    },
    users,
    tokens,
    menus
};

module.exports = routes;