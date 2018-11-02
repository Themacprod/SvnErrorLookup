const database = require('./database');

const findTree = function (tree) {
    return new Promise((resolve, reject) => {
        database.trees.findOne({
            value: tree
        }, (err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
};

const getCommit = function (commit) {
    return new Promise((resolve) => {
        database.commits.findOne({
            value: commit
        }, (err, doc) => {
            if (err) {
                resolve(null);
            } else {
                resolve(doc);
            }
        });
    });
};

const getTree = function (treeId) {
    return new Promise((resolve) => {
        database.trees.findOne({
            _id: treeId
        }, (err, doc) => {
            if (err) {
                resolve(null);
            } else {
                resolve(doc);
            }
        });
    });
};

const getBranch = function (branchId) {
    return new Promise((resolve) => {
        database.branches.findOne({
            _id: branchId
        }, (err, doc) => {
            if (err) {
                resolve(null);
            } else {
                resolve(doc);
            }
        });
    });
};

module.exports.findTree = findTree;
module.exports.getCommit = getCommit;
module.exports.getTree = getTree;
module.exports.getBranch = getBranch;
