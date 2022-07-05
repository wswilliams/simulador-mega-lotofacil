(function () {
    'use strict';

    var main = {};
    var Promise = require('bluebird');
    var async = require('async');
    //var log = require('../log/save-log.js');
    /**
     * [findDefault funcao de teste da model Dao]
     * @param  {[type]}   app [model (taxa)]
     * @param  {Function} cb  [callback]
     * @return {[type]}       [object]
     */
    main.findSalesperson = function (dataModels, data, cb) {
        var groupPermissionsUsers = dataModels.GroupPermissionsUsers;
        var salesperson = dataModels.Salesperson;
                    var where = {
                                "include":[
                                  { "relation": 'groupPermissions'},   
                                  {"relation": "salesperson"}
                                  ],
                                  "where": {
                                      "login":data.login
                                  }
                             };
                             
                groupPermissionsUsers.find(where, function (err, res) {
                        
                        var listGlobal=[];
                        if (res.length > 0)
                            cb(null, res);
                        else{
                            var where1 = {
                                "include":[
                                    {"relation": "groupPermissionsUsers",
                                        "scope": {
                                            "include": [
                                                {"relation": "groupPermissions"}
                                            ]
                                        }
                                    }
                                  ],
                                  "where": {
                                            "registry":data.registry
                                       }
                                  
                             };
                            salesperson.find(where1, function (err, res1) {
                                
                                if (res1.length > 0){
                                    var retunr =JSON.stringify(res1[0]);
                                    var json =JSON.parse(retunr);
                                    var list=[];
                                    var model={
                                         "salespersonId": json.salespersonId,
                                        "name": json.name,
                                        "createdAt": json.createdAt,
                                        "enabled": json.enabled,
                                        "groupPermissionsUsersId": json.groupPermissionsUsersId,
                                        "registry": json.registry,
                                        "companyId": json.companyId
                                       }
                                    list.push(model);
                                    var grup={ groupPermissionsUsersId: json.groupPermissionsUsers.groupPermissionsUsersId,
                                                groupPermissionsId: json.groupPermissionsUsers.groupPermissionsId,
                                                login: json.groupPermissionsUsers.login,
                                                password: json.groupPermissionsUsers.password,
                                                creatdAt: json.groupPermissionsUsers.creatdAt,
                                                firtLogin: json.groupPermissionsUsers.firtLogin,
                                                blocked: json.groupPermissionsUsers.blocked,
                                                enable: json.groupPermissionsUsers.enable,
                                            groupPermissions:json.groupPermissionsUsers.groupPermissions,
                                            salesperson: list
                                        }
                                     listGlobal.push(grup);
                                    cb(null, listGlobal);
                                }else
                                    cb(null, listGlobal);
                            });
                        }  
                    });
                
    }//fim findDefault

     /**
     * [findDefault funcao da model Dao]
     * @param  {[type]}   app [model (Employee)]
     * @param  {Function} cb  [callback]
     * @return {[type]}       [object]
     */
    main.findDefault = function (dataModels, data, cb) {
        var Salesperson = dataModels.Salesperson;
        Salesperson.find(data, function (err, res) {
            if (err === null)
                cb(null, res);
            else
                cb(null, err);
        });

    }//fim findDefault

        /**
     * [transaction transacao para insercao  e update ]
     * @param  {[type]} app    [models (employee)]
     * @param  {[type]} values [{employee:dados }]
     * @param  {[type]} _cb    [callback]
     * @return {[type]}        [boolean]
     */
    main.transaction = function (app, values, _cb) {
        var context = this,
               Salesperson = app.Salesperson,
		GroupPermissions=app.GroupPermissions,
                GroupPermissionsUsers = app.GroupPermissionsUsers,
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

        Salesperson.beginTransaction({}, function (err, tx) {
            options = {transaction: tx};

            switch (app.type) {
                case 'save':
                    salvar(values, options);
                    break;
                case 'update':
                    alterar(values, options);
                    break;
                default :
                    errorHandler('FALSE');
                    break;
            }


        });

        /**
         * [salvar realiza create de employee, 
         * @param  {[type]} values [{employee:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var salvar = function (values, options) {
            var response={
		    "count":0,
		    "success":0,
		    "fail":[]
		};
                var countL=0;
            async.eachSeries(values, function (element, callback) {
			response.count++;
        	        GroupPermissionsUsers.create(element.groupPermissionsUsers, options, function (errLT, model) {
                   
        	            if (errLT === null){
				element.salesperson.groupPermissionsUsersId=model.groupPermissionsUsersId;
				Salesperson.create(element.salesperson, options, function (errLT1, model1) {
				   if (errLT1 === null){
					response.success++;
					callback();
				   }else{
					response.fail.push({
                                            count:countL++,
                                            data:element
                                        });
	        	                callback('errLT');
				   }
				});
        	                
        	            }else{
				response.fail.push({
                                            count:countL++,
                                            data:element
                                        });
        	                callback('errLT');
			    }
        	      });

        	    }, function (err) {
                // if any of the file processing produced an error, err would equal that error
        	        if (err) {
        	            errorHandler(response);
        	        } else {

                   // var file = "/seller/" + app.nameFile;
                   // log.save(app.loginId, processingLog, 4, file,options, function (_return) {
                       // if (_return)
                            context.commit(response, options.transaction);
                      //  else
                          //  errorHandler('FALSE');
                    //});
        	        }
	            });
        };

	        /**
         * [salvar realiza update de employee, 
         * @param  {[type]} values [{employee:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        var alterar = function (values, options) {
            var response={
		    "count":0,
		    "success":0,
		    "fail":[]
		};
                var countL=0;
            async.eachSeries(values, function (element, callback) {
			response.count++;
        	        GroupPermissionsUsers.upsert(element.groupPermissionsUsers, options, function (errLT, model) {
                   
        	            if (errLT === null){
				element.salesperson.groupPermissionsUsersId=model.groupPermissionsUsersId;
				Salesperson.upsert(element.salesperson, options, function (errLT1, model1) {
				   if (errLT1 === null){
					response.success++;
					callback();
				   }else{
					response.fail.push({
                                            count:countL++,
                                            data:element
                                        });
	        	                callback('errLT');
				   }
				});
        	                
        	            }else{
				response.fail.push({
                                            count:countL++,
                                            data:element
                                        });
        	                callback('errLT');
			    }
        	      });

        	    }, function (err) {
                // if any of the file processing produced an error, err would equal that error
        	        if (err) {
        	            errorHandler(response);
        	        } else {

                   // var file = "/seller/" + app.nameFile;
                   // log.save(app.loginId, processingLog, 4, file,options, function (_return) {
                       // if (_return)
                            context.commit(response, options.transaction);
                      //  else
                          //  errorHandler('FALSE');
                    //});
        	        }
	            });
        };

    }// fim transactionDelete

    module.exports = main;

})();