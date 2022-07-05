'use strict';

module.exports = function(Salesperson) {

    var salespersonController = require('../../server/lvr/salesperson/server-salesperson.js');
    
    Salesperson.saveFile = function (values, cb) {
        
         var dependency = {nameFile: values.file.name,loginId: values.loginId};
        var args = [JSON.stringify(dependency)];
        
        var cp = require('child_process');
        var path = require('path');
        var child = cp.fork(path.resolve(__dirname, '../../server/lvr/salesperson/process.js'), args);

        child.on('message', function (res) {
            cb(null, res);

            // Send child process some work
            child.send('exit');
        });

        // Send child process some work
        child.send('start');
    };
    Salesperson.remoteMethod(
        'saveFile',
        {
            http: {verb: 'post'},
            returns: {arg: 'response', type: 'string'},
            accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
        }
    );
    
    
    Salesperson.findRegister = function (register,cb) {
        var app = Salesperson.app;
        var dataModels = {
            Salesperson: app.models.Salesperson,
            GroupPermissionUsers:app.models.GroupPermissionUsers,
            GroupPermission:app.models.GroupPermission,
            register:register
        };

        //get all salesperson
        salespersonController.findSalesPerson(dataModels, app, function (err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    Salesperson.remoteMethod(
            'findRegister',
            {
                http: {verb: 'get'},
                accepts: [
                    {arg: 'register', type: 'String', require: true}
                ],
                returns: {type: 'Salesperson', root: true}
            }
    );
};
