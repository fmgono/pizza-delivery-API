// Import routes
const users = require('./users');

const routes = {
    notFound(data,callback) {
        callback(404,{Error: 'End point not found!'});
    },
    users
};

module.exports = routes;