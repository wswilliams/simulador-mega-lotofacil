'use strict';

module.exports = function (GroupPermissionsUsers) {

    var groupController = require('../../server/lvr/groupPermissionsUsers/server-groupPermissionsUsers.js');

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
                returns: {arg: 'transaction', type: 'string', root: true},
                accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
            }
    );

};
