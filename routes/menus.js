// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const utils = require('../lib/utils');

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
            if (err) reject({statusCode: 500, result: `Could not create new menu`});
            resolve({statusCode: 200, result: message});
        });
    });
};

const updateFile = (dir, fileName, data) => {
    return new Promise((resolve,reject) => {
        _data.update(dir,fileName, data, err => {
            if (err) reject({statusCode: 500, result: `Could not update the Menu info`});
            resolve({statusCode: 200, result: `Menu has successfully updated`});
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

// Menus - post
// Required data : email, code, name, description, price
// Optional data : none
// @TODO : Only admin user can create a menus!
routes.post = function(data, callback) {
    // Get the property with destructuring ES6 syntax.
    let {code, name, description, price} = data.payload;
    code = code || '';
    name = name || '';
    description = description || '';
    price = price || '0';

    // Structuring to object again.
    const filteredFields = {code, name, description, price};

    // Parse filteredFields object to an array and check that every element is true / false.
    const isPassedFields = Object.values(filteredFields).every(isPassed => isPassed);

    // Check all required fields are filled out.
    if (!isPassedFields) callback(400, {message: 'Missing required fields.'});

    // Check the menu is not exists.
    _data.read('menus', code, (err, menuData) => {
        if (menuData) {
            callback(500, {message: `Menu with the code ${code} already registered`});
        } else {
            // Create menu
            createFile('menus', code, filteredFields)
            .then(result => callback(result.statusCode, result.result))
            .catch(error => callback(error.statusCode, error.message));
        }

    });

};


module.exports = baseRoutes;