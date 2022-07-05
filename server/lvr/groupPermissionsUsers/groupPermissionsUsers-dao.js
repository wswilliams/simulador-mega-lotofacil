/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {
    'use strict';

    var main = {};
    var Promise = require('bluebird');
    var async = require('async');
    var moment = require('moment');
    var formating = require('../utils/format.js');

    /**
     * [transaction transacao para insercao  e update ]
     * @param  {[type]} app    [models (Product)]
     * @param  {[type]} values [{Product:dados }]
     * @param  {[type]} _cb    [callback]
     * @return {[type]}        [boolean]
     */
    main.transaction = function (app, values, _cb) {
        var context = this,
                GroupPermissionsUsers= app.GroupPermissionsUsers,
                Salesperson=app.Salesperson,
                options;
        /**
         * Error handler. Prints out error message and
         * rollbacks everything done here.
         * @param msgObject Fail object.
         */
        var errorHandler = function (msgObject) {

            options.transaction.rollback();
            return _cb(null, msgObject);
        };
        /**
         * Commit transaction to database
         * @param object Object to be returned at callback
         * @param tx Company object
         */
        context.commit = function (object, tx) {
            tx.commit(function () {
                return _cb(null, object);
            });
        };

        GroupPermissionsUsers.beginTransaction({}, function (err, tx) {
            options = {transaction: tx};

            switch (app.type) {
                case 'update':
                    update(values, options);
                    break;
                case 'save':
                    save(values, options);
                    break;
                case 'updateUsers':
                    updateUsers(values, options);
                    break;
                case 'recover':
                    recover(values, options);
                    break;
                default :
                    errorHandler('FALSE');
                    break;
            }
        });

        /**
         * [save realiza update no groupPermissionsUsers,
         * @param  {[type]} values [{cluster:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var update = function (values, options) {
            //data Model

            function saveGroup(groupValue, callback) {
                    var newValue ={
                        "login": groupValue.login,
                        "password": groupValue.password,
                        "firtLogin": 1
                    };

                    GroupPermissionsUsers.updateAll({groupPermissionsUsersId:groupValue.groupPermissionsUsersId},newValue, options, function (err, group) {
                        if (err === null){
                            callback(group);
                         }else{
                            callback('false');
                        }
                    });
            }

            //Strat async
            function Init(value) {

                async.waterfall([
                    function(callback) {

                        saveGroup(value[0], function (group) {
                                callback(null,group);
                            });
                    }

                ], function (err, results) {
                    if (results === 'false') {
                        errorHandler({"response":500});
                    } else if (results.count === 0) {
                        errorHandler({"response":409});
                    } else {
                        context.commit({"response":200}, options.transaction);
                    }
                });

            }
            //start functions
            Init(values);
        };

                /**
         * [save realiza update no groupPermissionsUsers,
         * @param  {[type]} values [{groupPermissionsUsers:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var save = function (values, options) {
            //data Model

            function saveGroup(groupValue, callback) {

                    GroupPermissionsUsers.create(groupValue, options, function (err, group) {
                        if (err === null){
                            callback(group);
                         }else{
                            console.log(err)
                            callback('false');
                        }
                    });
            }
            function saveUsers(value,group, callback) {

                    value.groupPermissionsUsersId=group.groupPermissionsUsersId;
                        Salesperson.create(value, options, function (err, group) {
                            if (err === null){
                                callback(group);
                             }else{
                                console.log(err)
                                callback('false');
                            }
                        });
            }

            //Strat async
            function Init(value) {

                async.waterfall([
                    function(callback) {

                        saveGroup(value[0].groupPermissionsUsers[0], function (group) {
                                callback(null,group);
                            });
                    },
                    function(group,callback) {

                        saveUsers(value[0].users,group, function (users) {
                               var result={
                                   "groupPermissionsUsers":group,
                                   "users":users
                               }
                                callback(null,result);
                            });
                    }

                ], function (err, results) {
                    if (results.groupPermissionsUsers === 'false' || results.users === 'false') {
                        errorHandler({"response":500});
                    } else {
                          context.commit({"response":200}, options.transaction);
                    }
                });

            }
            //start functions
            Init(values);
        };

     /**
         * [updateUsers realiza update no groupPermissionsUsers,
         * @param  {[type]} values [{groupPermissionsUsers:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var updateUsers = function (values, options) {
            //data Model

            function saveGroup(groupValue, callback) {

                    GroupPermissionsUsers.upsert(groupValue, options, function (err, group) {
                        if (err === null){
                            callback(group);
                         }else{
                            console.log(err)
                            callback('false');
                        }
                    });
            }
            function saveUsers(value,group, callback) {
                        Salesperson.upsert(value, options, function (err, group) {
                            if (err === null){
                                callback(group);
                             }else{
                                console.log(err)
                                callback('false');
                            }
                        });
            }

            //Strat async
            function Init(value) {

                async.waterfall([
                    function(callback) {

                        saveGroup(value[0].groupPermissionsUsers[0], function (group) {
                                callback(null,group);
                            });
                    },
                    function(group,callback) {

                        saveUsers(value[0].users,group, function (users) {
                               var result={
                                   "groupPermissionsUsers":group,
                                   "users":users
                               }
                                callback(null,result);
                            });
                    }

                ], function (err, results) {

                    if (results.groupPermissionsUsers === 'false' || results.users === 'false') {
                        errorHandler({"response":500});
                    } else {
                          context.commit({"response":200}, options.transaction);
                    }
                });

            }
            //start functions
            Init(values);
        };

        /**
         * [recover realiza update groupPermissionsUsers,
         * @param  {[type]} values [{groupPermissionsUsers:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var recover = function(values, options){


           function updategroupPermissionsUsers(groupPermissionsUsers,callback){

                GroupPermissionsUsers.upsert(groupPermissionsUsers,options,function(err,model){

                    if(err === null){
                        callback(model);
                    }else{
                        console.log(err)
                        callback('false');
                    }
                });
            }


           function Init(value){

            async.waterfall([
                function(callback){

                    updategroupPermissionsUsers(value,function(purcharseorder){
                        callback(null,purcharseorder);
                    });
                }
            ],function (err, result){

                if(result === 'false'){
                    errorHandler({"response":500});
                }else{
                    context.commit({"response":200},options.transaction);
                }
            });
         }
         Init(values);
        }
    };


    module.exports = main;

})();
