'use strict';

module.exports = function(GroupPermissionsUsers) {

    var groupController = require('../../server/lvr/groupPermissionsUsers/server-groupPermissionsUsers.js');
    GroupPermissionsUsers.firtLogin = function (values, cb) {
        var app = GroupPermissionsUsers.app;
        var dataModels = {
            GroupPermissionsUsers: app.models.GroupPermissionsUsers,
            Employee: app.models.Employee,
            User: app.models.User,
            type: "update"
        };
        //save

        groupController.firtLogin(dataModels, values, function (err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    GroupPermissionsUsers.remoteMethod(
            'firtLogin',
            {
                http: {verb: 'post'},
                returns: {arg: 'transaction', type: 'string',root:true},
                accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
            }
    );

     GroupPermissionsUsers.save = function (values, cb) {
        var app = GroupPermissionsUsers.app;
        var dataModels = {
            GroupPermissionsUsers: app.models.GroupPermissionsUsers,
            Salesperson: app.models.Salesperson,
            dataSource: GroupPermissionsUsers.dataSource,
            type: "save"
        };
        //save

        groupController.save(dataModels, values, function (err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    GroupPermissionsUsers.remoteMethod(
            'save',
            {
                http: {verb: 'post'},
                returns: {arg: 'transaction', type: 'string',root:true},
                accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
            }
    );

    GroupPermissionsUsers.getAplicationVersion= function(cb){

        groupController.aplicationVersion(function (err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };
    GroupPermissionsUsers.remoteMethod(
        'getAplicationVersion',
        {
          http:{verb: 'get'},
          description:'Get aplication version .',
          returns: {arg: 'report', type: 'string',root:true}
        }
    );

      GroupPermissionsUsers.recoverPassword = function (values, cb) {
        var app = GroupPermissionsUsers.app;
        var dataModels = {
            GroupPermissionsUsers: app.models.GroupPermissionsUsers,
            User: app.models.User,
            ForgotPassword: app.models.ForgotPassword,
            dataSource: GroupPermissionsUsers.dataSource,
            type: 'recover'
        };

        groupController.recover(dataModels, values, function (err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    GroupPermissionsUsers.remoteMethod(
            'recoverPassword',
            {
                http: {verb: 'post'},
                returns: {arg: 'transaction', type: 'string',root:true},
                accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
            }
    );

        // seleciona produto via query
    GroupPermissionsUsers.findRemote = function (query, cb) {

      groupController.searchUsers(GroupPermissionsUsers.app, query, function (err, res) {
          if (err)
              cb(null, err);
          else
              cb(null, res);
      });
    };

    GroupPermissionsUsers.remoteMethod(
            'findRemote',
            {
                http: {verb: 'post'},
                returns: {arg: 'return', type: 'object'},
                accepts: {arg: 'query', type: 'object', http: {source: 'body'}}
            }
    );

    GroupPermissionsUsers.findRemoteCount = function (query, cb) {

        var where = {filter: {where: query.filter.where, field: false}};

        groupController.searchUsers(GroupPermissionsUsers.app, where, function (err, res) {
            if (err)
                cb(null, err);
            else
                cb(null, res);
        });
    };

    GroupPermissionsUsers.remoteMethod(
            'findRemoteCount',
            {
                http: {verb: 'post'},
                returns: {arg: 'return', type: 'object'},
                accepts: {arg: 'query', type: 'object', http: {source: 'body'}}
            }
    );

};
