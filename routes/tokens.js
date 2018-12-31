const _data = require('../lib/data');
const helpers = require('../lib/helpers');

const listMethods = ['post','get','put','delete'];

/*
 * Make a wrapper function that return promise.
 */
const readFile = (dir, fileName) => {
    return new Promise((resolve,reject) => {
        _data.read(dir, fileName, (err, data) => {
            if (err) reject({statusCode: 404, result: `Data not found!`});
            resolve({statusCode: 200, result: data});
        });
    });
};

const createFile = (dir, fileName, data) => {
    return new Promise((resolve,reject) => {
        _data.create(dir, fileName, data, (err,message) => {
            if (err) reject({statusCode: 500, result: `Could not create token`});
            resolve({statusCode: 200, result: `Token has been successfully created.`});
        });
    });
};

const updateFile = (dir, fileName, data) => {
    return new Promise((resolve,reject) => {
        _data.update(dir,fileName, data, err => {
            if (err) reject({statusCode: 500, result: `Could not update the users info`});
            resolve({statusCode: 200, result: `Token has successfully updated`});
        });
    });
};

const deleteFile = (dir, fileName) => {
    return new Promise((resolve,reject) => {
        _data.delete(dir, fileName, (err, message) => {
            if (err) reject({statusCode: 500, result: err});
            resolve({statusCode: 200, result: message});
        });
    });
};

const baseRoutes = (data,callback) => listMethods.includes(data.method) ? routes[data.method](data,callback) : callback(405, {message: `Service with that method, doesn't exists in this endpoint!`});

const routes = {};

// Tokens - post
// Required data : email, password
// Optional data : none
routes.post = function(data, callback) {
    let {email, password} = data.payload;
    email = email || '';
    password = password ? (password.length >= 8 ? password : '') : '';

    // Structuring to object again.
    const filteredFields = {email, password};

    // Parse filteredFields object to an array and check that every element is true / false.
    const isPassedFields = Object.values(filteredFields).every(isPassed => isPassed);

    if (!isPassedFields) callback(400, {message: 'Missing required fields.'});

    // Lookup the user's who matches that email.
    _data.read('users', email, (err, userData) => {
        if (err) callback(400, {message: `Could not find the specified user`});

        // Hash the sent password, and compare it to the password that stored in the user object.
        const hashedPassword = helpers.hash(password);
        if (hashedPassword != userData.password) callback(400, {message: `Wrong password`});
        
        // if valid,create a new token & expiration date 1 hour i the future.
        const tokenId = helpers.generateToken(20);
        const expires = Date.now() * 1000 * 60 * 60;

        const tokenObject = {
            email,
            tokenId,
            expires
        };

        // Store the token.
        createFile('tokens', tokenId, tokenObject)
        .then(results => callback(results.statusCode, tokenObject))
        .catch(error => callback(error.statusCode, error.result))

    });
};

// Tokens - get
// Required data : tokenId
// Optional data : none
routes.get = function(data, callback) {
    const tokenId = data.query.tokenId ? data.query.tokenId.trim() : '';

    if (!tokenId) callback(400, {message: `Missing required field`});

    readFile('tokens', tokenId)
    .then(results => callback(results.statusCode, results.result))
    .catch(error => callback(error.statusCode, error.result));
    
};

// Tokens - put
// Required data : tokenId
// Optional data : none
routes.put = function(data, callback) {
    let {tokenId, extend} = data.payload;
    tokenId = tokenId ? tokenId.trim() : '';
    extend = extend ? extend : false;

    if (!tokenId || !extend) callback(400, {message: `Missing required fields`});

    // Lookup for the token
    readFile('tokens', tokenId)
    .then(results => {
        // Check token is expired or not
        if (results.result.expires < Date.now()) callback(400, {message: `The token has already expired and cannot be extended`});
        results.result.expires = Date.now() + 1000 * 60 * 60;
        _data.update('tokens', tokenId, results.result, (err, message) => {
            if (err) callback(500, {message: `Could not update the token`});
            callback(200, {message: `Token has successfully updated`});
        });
    })
    .catch(error => callback(error.statusCode, error.result));
};

// Tokens - delete
// Required field : tokenId
// Optional field : none
routes.delete = function(data, callback) {
    const tokenId = data.query.tokenId ? data.query.tokenId.trim() : '';
    if (!tokenId) callback(400, {message: `Missing required fields`});
    // Lookup the Users data.
    _data.read('tokens',tokenId, (err) => {
        if (err) callback(400, {message: 'The Token does not exists'});
        deleteFile('tokens', tokenId)
        .then(results => callback(results.statusCode, results.result))
        .catch(error => callback(error.statusCode, error.result));
    });
};

module.exports = baseRoutes;