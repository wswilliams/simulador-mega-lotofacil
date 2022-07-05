'use strict';

module.exports = function(NumerosSortiados) {

    var testSet = require('../../server/lvr/numbersort/server-numero-sortiados.js');
    NumerosSortiados.saveFile = function (values, cb) {
        
        var dependency = {nameFile: values.file.name,loginId: values.loginId,typeNumerosSortiadosId:values.typeNumerosSortiadosId};
        var args = [JSON.stringify(dependency)];
        
        var cp = require('child_process');
        var path = require('path');
        var child = cp.fork(path.resolve(__dirname, '../../server/lvr/numbersort/process.js'), args);

        child.on('message', function (res) {
            cb(null, res);

            // Send child process some work
            child.send('exit');
        });

        // Send child process some work
        child.send('start');
    };
    NumerosSortiados.remoteMethod(
        'saveFile',
        {
            http: {verb: 'post'},
            returns: {arg: 'response', type: 'string'},
            accepts: {arg: 'object', type: 'object', http: {source: 'body'}}
        }
    );

    NumerosSortiados.findCoutNumber = function(cb) {
        var app = NumerosSortiados.app;
        var dataModels = {
            NumerosSortiados: app.models.NumerosSortiados
        };

        
        testSet.findCoutNumber(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };
    NumerosSortiados.finJogos = function(cb) {
        var app = NumerosSortiados.app;
        var dataModels = {
            NumerosSortiados: app.models.NumerosSortiados
        };

        testSet.finJogos(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    NumerosSortiados.findDiscting = function(cb) {
        var app = NumerosSortiados.app;
        var dataModels = {
            NumerosSortiados: app.models.NumerosSortiados
        };

        
        testSet.findDiscting(dataModels, app, function(err, res) {
            if (!res) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    };

    NumerosSortiados.remoteMethod(
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

    NumerosSortiados.remoteMethod(
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
    NumerosSortiados.remoteMethod(
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
