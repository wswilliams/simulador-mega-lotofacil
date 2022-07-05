/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {
    'use strict';

    var sellerController = require('./server-salesperson.js');
    var dependency = JSON.parse(process.argv[2]);
    process.on('message', function (msg) {
        if (msg === 'start')
            run();
        else if (msg === 'exit')
            process.exit();
    });


    function run() {
        var loopback = require('loopback');
        var boot = require('loopback-boot');
        var path = require('path');

        var serverPath = path.resolve(__dirname, '../../');
        var app = module.exports = loopback();

        // Bootstrap the application, configure models, datasources and middleware.
        // Sub-apps like REST API are mounted via boot scripts.
        boot(app, serverPath, function (err) {
            if (err)
                throw err;
                
            var dataModels = {
                Salesperson: app.models.Salesperson,
                GroupPermissions: app.models.GroupPermissions,
		GroupPermissionsUsers:app.models.GroupPermissionsUsers,
                type: 'save',
                loginId: dependency.loginId,
                nameFile: dependency.nameFile
            };
            
            //save
            sellerController.saveFile(dataModels, dependency.nameFile, function (err, res) {
                process.send(res);
            });

        });
    }
})();