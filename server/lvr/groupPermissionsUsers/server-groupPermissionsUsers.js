/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {
    'use strict';

    // Módulos externos
    var fs = require('fs');
    var path = require('path');
    var moment = require('moment');
    var Promise = require('bluebird');
    var async = require('async');
    var formating = require('../utils/format.js');
    var bcrypt = require('bcrypt-nodejs');
    var rand = require('lodash');
    var forgot = require('../forgotPassword/server-forgotPassword.js');

    var main = {},
            groupDao = require('./groupPermissionsUsers-dao.js');

    /**
     * [firtLogin all data app base]
     * @param  {[type]} dataModels  [dataModels]
     * @param  {[type]} value  [value]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.firtLogin = function (dataModels, value, _cb) {

        //data Model
        function dataGroup(modelValue) {
            var salt = bcrypt.genSaltSync(10);
            return new Promise(function (resolve, reject) {

                var where = {
                    "where": {
                        "login": modelValue.login
                    }
                }

                dataModels.GroupPermissionsUsers.find(where, function (err, res) {
                    var newModel = {
                        "groupPermissionsUsersId": 0,
                        "groupPermissionsId": 0,
                        "login": "string",
                        "password": "string",
                        "firtLogin": 0,
                        "blocked": 0,
                        "enable": 0
                    }; //Conta em branco

                    if ((res.length > 0) && (modelValue.firtLogin === 0)) { //Se email existe e é o primeiro login
                        //resolve(newModel);
                    } else {
                        newModel.groupPermissionsUsersId = modelValue.groupPermissionsUsersId;
                        newModel.groupPermissionsId = modelValue.groupPermissionsId;
                        newModel.login = modelValue.login;
                        newModel.password = modelValue.password;
                        newModel.firtLogin = 1;
                        newModel.blocked = 0;
                        newModel.enable = 1;
                        //resolve(newModel);
                    }

                    var where2 = {
                        "email": modelValue.email
                    };

                    dataModels.User.find(where2, function (err, res) {

                        if (res.length) {
                            dataModels.User.deleteById(res[0].id, function (errT, resT) {
                                resolve(newModel);
                            })
                        } else {
                            resolve(newModel);
                        }
                    });

                });
            });
        } // Fim Data Group

        //Strat async
        function Init(value) {

            async.parallel([
                /**
                 * @param {Function} cb [callback]
                 */
                function (callback) {

                    dataGroup(value).then(function (data) {
                        callback(null, data);
                    });
                },
            ], function (err, model) {
                if (model.groupPermissionsUsersId == 0)
                    _cb(null, {"response": 404});
                else {
                    groupDao.transaction(dataModels, model, function (errTran, resTran) {
                        if (!resTran)
                            _cb(null, errTran);
                        else
                            _cb(null, resTran);
                    });
                }
            });

        }
        Init(value);

    };//fim findJson()

    /**
     * [save all data groupPermissionsUsers base]
     * @param  {[type]} dataModels  [dataModels]
     * @param  {[type]} value  [value]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.save = function (dataModels, value, _cb) {
        //data Model
        function dataGroup(modelValue) {
            return new Promise(function (resolve, reject) {
                var salt = bcrypt.genSaltSync(10);
                var newModel =
                        {
                            "groupPermissionsUsersId": 0,
                            "groupPermissionsId": 0,
                            "login": "string",
                            "password": "string",
                            "creatdAt": "string",
                            "firtLogin": 0,
                            "blocked": 0,
                            "enable": 0
                        };
                if (modelValue.groupPermissionsUsersId > 0) {
                    dataModels.GroupPermissionsUsers.findById(modelValue.groupPermissionsUsersId, function (err, res) {
                        newModel.groupPermissionsUsersId = modelValue.groupPermissionsUsersId;
                        newModel.groupPermissionsId = modelValue.groupPermissionsId;
                        newModel.login = modelValue.login;
                        newModel.password = modelValue.password === "" ? res.password : bcrypt.hashSync(modelValue.password, salt);
                        newModel.creatdAt = res.creatdAt;
                        newModel.firtLogin = res.firtLogin;
                        newModel.blocked = res.blocked;
                        newModel.enable = res.enable;
                        resolve(newModel);
                    });
                } else {
                    newModel.groupPermissionsUsersId = 0;
                    newModel.groupPermissionsId = modelValue.groupPermissionsId;
                    newModel.login = modelValue.login;
                    newModel.password = bcrypt.hashSync(modelValue.password, salt);
                    newModel.creatdAt = moment().format('YYYY-MM-DD HH:mm:ss');
                    newModel.firtLogin = 0;
                    newModel.blocked = 0;
                    newModel.enable = 1;
                    resolve(newModel);
                }
                ;
            });
        }

        function dataUsers(modelValue) {
            return new Promise(function (resolve, reject) {
                var newModel = {
                    "salespersonId": 0,
                    "name": "string",
                    "createdAt": "string",
                    "enabled": 0,
                    "groupPermissionsUsersId": 0,
                    "registry": "string",
                    "companyId": 0
                };
                if (modelValue.groupPermissionsUsersId > 0) {

                    var sqlQuery = fs.readFileSync(path.resolve(__dirname, '../salesperson/sql/select-login.sql')).toString();
                    var sql = "u.login = '" + modelValue.login + "' AND g.group_permissions_id <> 2 AND s.group_permissions_users_id =" + modelValue.groupPermissionsUsersId;

                    sqlQuery = formating.format(sqlQuery, sql);

                    dataModels.dataSource.connector.query(sqlQuery, function (err, res) {
                        if (res.length > 0) {
                            newModel.salespersonId = res[0].salesperson_id;
                            newModel.name = modelValue.name;
                            newModel.createdAt = res[0].created_at;
                            newModel.enabled = res[0].enabled;
                            newModel.groupPermissionsUsersId = res[0].group_permissions_users_id;
                            newModel.registry = res[0].registry;
                            newModel.companyId = modelValue.companyId > 0 ? modelValue.companyId : res[0].company_id;
                        }
                        resolve(newModel);
                    });
                } else {
                    newModel.salespersonId = 0;
                    newModel.name = modelValue.name;
                    newModel.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
                    newModel.enabled = 1;
                    newModel.groupPermissionsUsersId = 0;
                    newModel.registry = "101010";
                    newModel.companyId = modelValue.companyId > 0 ? modelValue.companyId : null;
                    resolve(newModel);
                }
            });
        }

        //Strat async
        function Init(value) {

            async.parallel([
                /**
                 * @param {Function} cb [callback]
                 */
                function (callback) {

                    dataGroup(value).then(function (groupPermissionsUsers) {
                        callback(null, groupPermissionsUsers);
                    });
                }],
                    function (err, groupPermissionsUsers) {
                        async.parallel([
                            function (callback) {
                                dataUsers(value).then(function (users) {
                                    var result = {
                                        "groupPermissionsUsers": groupPermissionsUsers,
                                        "users": users
                                    };

                                    callback(null, result);
                                });
                            }],
                                function (err, model) {
//                            console.log(JSON.stringify(model))
                                    if (model[0].groupPermissionsUsers[0].groupPermissionsUsersId > 0) {
                                        dataModels.type = "updateUsers";
                                    }
                                    groupDao.transaction(dataModels, model, function (errTran, resTran) {
                                        if (!resTran)
                                            _cb(null, errTran);
                                        else
                                            _cb(null, resTran);
                                    });

                                });
                    });
        }

        Init(value);

    };//fim findJson()

    /**
     * [aplicationVersion list version aplication base]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.aplicationVersion = function (cb) {
        var v = require('../../.././package.json');
        cb(null, {"version": v.version});
    };


    /**
     * [recover the password employee]
     * @param  {[type]} dataModels  [dataModels]
     * @param  {[type]} value  [value]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.recover = function (dataModels, value, _cb) {

        //data Model
        function getGroupPermissionsUsers(modelValue) {
            return new Promise(function (resolve, reject) {

                var newModel =
                        {
                            "groupPermissionsUsersId": 0,
                            "groupPermissionsId": 0,
                            "login": "string",
                            "password": "string",
                            "creatdAt": "string",
                            "firtLogin": 0,
                            "blocked": 0,
                            "enable": 0
                        };


                rand.random(1, 100);
                var where = {
                    "where": {
                        "login": modelValue.login,
                        'firtLogin': 1
                    }
                }

                dataModels.GroupPermissionsUsers.find(where, function (err, res) {

                    if (res.length > 0) {

                        newModel.groupPermissionsUsersId = res[0].groupPermissionsUsersId;
                        newModel.groupPermissionsId = res[0].groupPermissionsId;
                        newModel.login = res[0].login;
                        newModel.password = hash();
                        newModel.creatdAt = res[0].creatdAt;
                        newModel.firtLogin = res[0].firtLogin;
                        newModel.blocked = res[0].blocked;
                        newModel.enable = res[0].enable;
                        resolve(newModel);
                    } else
                        reject();
                });
                function hash() {
                    var newHash = "";
                    for (var k = 0; k < 4; k++) {
                        newHash += rand.random(1, 100);
                    }
                    return newHash;
                }

            });
        }
        //Strat async
        function Init(value) {

            async.parallel([
                /**
                 * @param {Function} cb [callback]
                 */
                function (callback) {

                    getGroupPermissionsUsers(value).then(function (groupPermissionsUsers) {
                        
                        callback(null, groupPermissionsUsers);
                    }).catch(function () {
                        _cb(null, {"response": 404});
                    });
                }],
                    function (err, groupPermissionsUsers) {


                        if (groupPermissionsUsers[0].groupPermissionsUsersId > 0) {
                            var salt = bcrypt.genSaltSync(10);
                            var credentials = {
                                "email": groupPermissionsUsers[0].login,
                                "password": groupPermissionsUsers[0].password
                            };
                            forgot.sendPasswordToEmail(groupPermissionsUsers[0].login, groupPermissionsUsers[0].password)
                                    .then(function () {
                                        var where = {
                                            "email": groupPermissionsUsers[0].login
                                        };
                                        dataModels.User.find(where, function (err, res) {

                                            if (res.length) {
                                                dataModels.User.deleteById(res[0].id, function (errT, resT) {
                                                    if (!resT)
                                                        _cb(null, {"response": 500, "error": errT});
                                                    else {
//                                                           console.log("groupPermissionsUsers[0].password ",groupPermissionsUsers[0].password)
                                                        groupPermissionsUsers[0].password = bcrypt.hashSync(groupPermissionsUsers[0].password, salt);
                                                        groupDao.transaction(dataModels, groupPermissionsUsers[0], function (errTran, resTran) {
                                                            _cb(null, resTran);
                                                        });
                                                    }
                                                });
                                            } else {
                                                
                                                groupPermissionsUsers[0].password = bcrypt.hashSync(groupPermissionsUsers[0].password, salt);
                                                groupDao.transaction(dataModels, groupPermissionsUsers[0], function (errTran, resTran) {
                                                    _cb(null, resTran);
                                                });
                                            }
                                        });
                                    })
                                    .catch(function (err) {
                                        console.log(err)
                                        _cb(null, {"response": 404});
                                    });

                        } else
                            _cb(null, {"response": 404});

                    });
        }

        Init(value);
    }






    //Select Users by filter query
    main.searchUsers = function (dataModels, query, cb) {

        var GroupPermissionsUsers = dataModels.models.GroupPermissionsUsers;
        var ds = GroupPermissionsUsers.dataSource;
        var skip = query.filter.skip;
        var limit = query.filter.limit;

        var fields = query.filter.field !== false ? " s.name, c.name as companyName, u.login, g.name as permissionName, u.enable, u.group_permissions_users_id as groupPermissionsUsersId " : "count(*) as count ";

        var login = query.filter.where.login !== undefined ? "u.login like '%" + query.filter.where.login + "%' and s.enabled = 1" : "";
        var profile = query.filter.where.profile !== undefined ? "g.name like '%" + query.filter.where.profile + "%' and s.enabled = 1" : "";
        var name = query.filter.where.name !== undefined ? "s.name like '%" + query.filter.where.name + "%' and s.enabled = 1" : "";
        var company = query.filter.where.company !== undefined ? "c.name like '%" + query.filter.where.company + "%' and s.enabled = 1" : "";
        var where = "";

        if (name !== "") {
            where = " where " + name;
        } else if (profile !== "") {
            where = " where " + profile;
        } else if (login !== "") {
            where = "where " + login;
        } else if (company !== "") {
            where = "where " + company;
        }

        //Filter by groupPermissionId, independently another filters
        if (where !== "") {
            where = where + " and ";
        } else {
            where = "where "
        }
        where = where + "(u.group_permissions_id = 1 OR u.group_permissions_id = 3 OR u.group_permissions_id = 4 OR u.group_permissions_id = 5)";

        var limit = query.filter.field !== false ? " order by s.name asc limit " + limit + " offset " + skip : " order by s.name asc";
        var sql = fs.readFileSync(path.resolve(__dirname, 'sql/select-user-filter.sql')).toString();

        if (JSON.stringify(query.filter.where) !== "{}") {

            sql = formating.format(sql, fields, where + limit);
        } else {

            sql = formating.format(sql, fields, limit);
        }

        ds.connector.query(sql, function (err, res) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });

    };

    module.exports = main;


})();
