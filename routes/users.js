// Dependencies
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
            if (err) reject({statusCode: 500, result: `Could not create new user`});
            resolve({statusCode: 200, result: message});
        });
    });
};

const updateFile = (dir, fileName, data) => {
    return new Promise((resolve,reject) => {
        _data.update(dir,fileName, data, err => {
            if (err) reject({statusCode: 500, result: `Could not update the users info`});
            resolve({statusCode: 200, result: `User has successfully updated`});
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

const baseRoutes = (data,callback) => listMethods.includes(data.method) ? routes[data.method](data,callback) : callback(405);

const routes = {};

// Users - post
// Required data : fullName,email,phone,streetAddress,password
// Optional data : none
routes.post = function(data, callback) {
    // Get the property with destructuring ES6 syntax.
    let {fullName,email,phone,streetAddress,password} = data.payload;
    fullName = fullName || '';
    email = email || '';
    phone = phone || '';
    streetAddress = streetAddress || '';
    password = password ? (password.length >= 8 ? password : '') : '';
    
    // Structuring to object again.
    const filteredFields = {fullName,email,phone,streetAddress,password};

    // Parse filteredFields object to an array and check that every element is true / false.
    const isPassedFields = Object.values(filteredFields).every(isPassed => isPassed);

    // Check all required fields are filled out.
    if (!isPassedFields) {
        callback(400, {message: 'Missing required fields.'});
    } else {
        // Check the user does not exists.
        _data.read('users',email, (err, usersData) => {
            if (usersData) {
                callback(500, {message: `Email with the address ${email} already registered`});
            } else {
                // Hash the password.
                const hashedPassword = helpers.hash(password);
                if (!hashedPassword) {
                    callback(500, {message: `Could not hash the user's password`});
                } else {
                    filteredFields.password = hashedPassword;
                    createFile('users', email, filteredFields)
                    .then(result => callback(result.statusCode, result.result))
                    .catch(error => callback(error.statusCode, error.message));
                }

            }
        });
    }
};

// Users - get
// Required field : email
// Optional field : none
routes.get = function(data, callback) {
    // Check the required field.
    const email = data.query.email.trim() || false;

    if (!email) {
        callback(400, {Error: 'Missing required field'});
    } else {
        // Consuming promise
        readFile('users',email)
        .then(results => {
            // Remove the password fields when returning it to the requester.
            delete results.result.password;
            callback(results.statusCode, results.result);
        })
        .catch(error => callback(error.statusCode, error.result));
    }
};

// Users - put
// Required field : email
// Optional field : fullName,phone,streetAddress
routes.put = function(data, callback) {
    // Get the property with destructuring ES6 syntax.
    let {fullName,email,phone,streetAddress} = data.payload;
    fullName = fullName || '';
    email = email || '';
    phone = phone || '';
    streetAddress = streetAddress || '';

    // If required field not fullfilled, throw error.
    if (!email) callback(400, {message: 'Missing required field'});

    // If one of optional field not fullfilled, throw error .
    if (!fullName && !phone && !streetAddress) callback(400, {message: 'Missing required field'});

    // Lookup the user.
    _data.read('users',email, (err,userData) => {
        // Update the necessary field.
        if (err) callback(400, {message: 'The User does not exists'});
        
        // Update userData Object.
        fullName ? userData.fullName = fullName : null;
        phone ? userData.phone = phone : null;
        streetAddress ? userData.streetAddress = streetAddress : null;

        // Store the new updated data.
        updateFile('users', email, userData)
        .then(results => callback(results.statusCode, results.result))
        .catch(error => callback(error.statusCode, error.result));
    });
};

// Users - delete
// Required field : email
// Optional field : none
routes.delete = function(data, callback) {
    // Check the required field.
    const email = data.query.email.trim() || false;
    if (!email) {
        callback(404, {message: 'The user does not exists'});
    } else {
        // Lookup the Users data.
        _data.read('users',email, (err) => {
            if (err) callback(400, {Error: 'The User does not exists'});
            deleteFile('users', email)
            .then(results => callback(results.statusCode, results.result))
            .catch(error => callback(error.statusCode, error.result));
        });
    }


    // callback(200, {message: `delete method is work!`});
};

module.exports = baseRoutes;