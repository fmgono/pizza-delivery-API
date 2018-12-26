/* 
 * Library for storing and editing data.
 */

//  Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Container for module (to be exported)
const lib = {};

/*
 * Make a wrapper function that return promise.
 */
const openFile = (path,format) => {
    return new Promise((resolve,reject) => {
        fs.open(path,format, (err,fileDescriptor) => {
            if (err) reject(`Could not create new file, it may already exists.`);
            resolve(fileDescriptor);
        })
    });
};

// Writing the file.
const writeFile = (fileDescriptor,data) => {
    return new Promise((resolve,reject) => {
        fs.writeFile(fileDescriptor, data, err => {
            if (err) reject(`Error writing to new file.`);
            resolve(fileDescriptor);
        });
    });
};

// Closing the file.
const closedFile = (fileDescriptor) => {
    return new Promise((resolve,reject) => {
        fs.close(fileDescriptor, err => {
            if (err) reject(`Error closing new file.`);
            resolve({err, message:`Writing a new file is done`});
        });
    });
};

// Read the file.
const readFile = (dir,format) => {
    return new Promise((resolve,reject) => {
        fs.readFile(dir, format, (err, data) => {
            if (err) reject('Error while reading this file.');
            let parsedData = helpers.parseJsonToObject(data);
            resolve({err,parsedData});
        });
    });
};

// Truncate the file
const truncateFile = (fileDescriptor) => {
    return new Promise((resolve,reject) => {
        fs.ftruncate(fileDescriptor, err => {
            if (err) reject('Error while truncate file.');
            // write to the file and close it.
            resolve(fileDescriptor);
        });
    });
};

// Unlink the file.
const unlinkFile = (path) => {
    return new Promise((resolve,reject) => {
        fs.unlink(path, err => {
            if (err) reject('Error while deleting file.');
            resolve({err,message: 'Deleting file is done.'});
        });
    })
};

// Base directory of the data folder.
lib.baseDir = path.join(__dirname,'/../.data/');

// Write data to a file.
lib.create = function(dir, fileName, data, callback) {
    // Convert data to string
    const stringifiedData = JSON.stringify(data);

    const response = async () => {
        // Opening File
        const openingFile = await openFile(`${this.baseDir}${dir}/${fileName}.json`, 'wx');
        // Writing to the File
        const writingFile = await writeFile(openingFile,stringifiedData);
        // closing file
        return await closedFile(writingFile);
    };

    response()
    .then(result => callback(result.err, result.message))
    .catch(err => callback(err));
};

// Read a file
lib.read = function(dir,fileName, callback) {
    // Consume a promise function.
    readFile(`${lib.baseDir}${dir}/${fileName}.json`,'utf8')
    .then(result => callback(result.err, result.parsedData))
    .catch(error => callback(error));
};

// Update data inside the file.
lib.update = function(dir,fileName,data,callback) {
    // Convert data to string
    const stringData = JSON.stringify(data);

    // Consume promise with async/await function.
    const response = async () => {
        const openedFile = await openFile(`${this.baseDir}${dir}/${fileName}.json`, 'r+');
        const truncatedFile = await truncateFile(openedFile);
        const writedFile = await writeFile(truncatedFile, stringData);
        return await closedFile(writedFile);
    };

    response()
    .then(result => callback(result.err, result.message))
    .catch(error => callback(error));
};

// Delete the file.
lib.delete = function(dir,fileName, callback) {
    unlinkFile(`${this.baseDir}${dir}/${fileName}.json`)
    .then(result => callback(result.err, result.message))
    .catch(err => callback(err));
};

module.exports = lib;