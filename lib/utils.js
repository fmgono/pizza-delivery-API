/* 
 * Helpers for various tasks
 *
 * */

// Dependencies
const _data = require('./data');

// Container for all utils.
const utils = {};

// Verify Token is valid and match with the given user.
utils.verifyToken = function(tokenId, email, callback) {
    if (!tokenId || !email) callback(false);
    _data.read('tokens', tokenId, (err, tokenData) => {
        if (err) callback(false);
        if (tokenData.email != email || tokenData.expires < Date.now()) callback(false);
        callback(true);
    });
};

module.exports = utils;