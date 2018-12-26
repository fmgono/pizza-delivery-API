/* 
 * Helpers for various tasks
 *
 * */

//  Dependencies
const crypto = require('crypto');

const config = require('./config');

//  Container for all the helpers.
const helpers = {};

// Create a SHA256
helpers.hash = function(password) {
    if (password) {
        return crypto.createHmac('sha256', config.hashingSecret).update(password).digest('hex');
    } else {
        return false;
    }
};

// Parse JSON to an object in all cases,without throwing.
helpers.parseJsonToObject = function(stringifyObj) {
    try {
        return JSON.parse(stringifyObj);
    } catch (error) {
        return {};
    }
};

module.exports = helpers;