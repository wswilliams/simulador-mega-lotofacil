'use strict';

module.exports = function(NumerosMegaSena) {
    var testSet = require('../../server/lvr/numbermega/server-numero-mega.js');
    NumerosMegaSena.saveFile = function (values, cb) {
        
        var dependency = {nameFile: values.file.name,loginId: values.loginId,typeNumerosSortiadosId:values.typeNumerosSortiadosId};
        var args = [JSON.stringify(dependency)];
        
        var cp = require('child_process');
        var path = require('path');
        var child = cp.fork(path.resolve(__dirname, '../../server/lvr/numbermega/process.js'), args);

        child.on('message', function (res) {
            cb(null, res);

            // Send child process some work
            child.send('exit');
        });

        // Send child process some work
        child.send('start');
    };
    NumerosMegaSena.remoteMethod(
        'saveFile',
        {
            http: {verb: 'post'},
            returns: {arg: 'response', type: 'string'},
            accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
        }
    );

    NumerosMegaSena.findCoutNumber = function(cb) {
        var app = NumerosMegaSena.app;
        var dataModels = {
            NumerosMegaSena: app.models.NumerosMegaSena
        };

        
        testSet.findCoutNumber(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };
    NumerosMegaSena.finJogos = function(cb) {
        var app = NumerosMegaSena.app;
        var dataModels = {
            NumerosMegaSena: app.models.NumerosMegaSena
        };

        testSet.finJogos(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };
    NumerosMegaSena.findDiscting = function(cb) {
        var app = NumerosMegaSena.app;
        var dataModels = {
            NumerosMegaSena: app.models.NumerosMegaSena
        };

        
        testSet.findDiscting(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    NumerosMegaSena.remoteMethod(
        'findCoutNumber',{
            http: {
                verb: 'get'
            },
            returns: {
                type: 'object',
                root: true
            }
        }
    );

    NumerosMegaSena.remoteMethod(
        'finJogos',{
            http: {
                verb: 'get'
            },
            returns: {
                type: 'object',
                root: true
            }
        }
    );
    NumerosMegaSena.remoteMethod(
        'findDiscting',{
            http:{
                verb:'get'
            },
            returns: {
                type: 'Array',
                root: true
            }
        }
    );
};
