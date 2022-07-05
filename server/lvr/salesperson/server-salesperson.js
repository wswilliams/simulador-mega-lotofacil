(function () {
    'use strict';

    // Módulos externos
    var fs = require('fs');
    var path = require('path');
    var moment = require('moment');
    var Promise = require('bluebird');
    var async = require('async');
//    var formating = require('../utils/format.js');
    var bcrypt = require('bcrypt-nodejs');
    var formating = require('../utils/format.js');
    

    var main = {},
    salespersonDao = require('./salesperson-dao.js'), excelParser = require('excel-parser');

   
  
    /**
     * [findEmployee return all data Employee]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.findSalesPerson = function (dataModels, app, _cb) {
       
             if(formating.isNullOrUndefined(dataModels.register)){
                _cb(null, {response:"parametro não definido para essa consulta"});
             }else{
                // get all Employee
                var where = {
                    "where": {
                            'registry': dataModels.register
                            }
                };
               
                dataModels.Salesperson.find(where, function (err, data) {
                    
                    if (data.length > 0) {
                        var obj={
                            "salespersonId": data[0].salespersonId,
                            "name": data[0].name,
                            "createdAt": data[0].createdAt,
                            "enabled": data[0].enabled,
                            "groupPermissionsUsersId": data[0].groupPermissionsUsersId,
                            "registry": data[0].registry
                          }
                        _cb(null, obj);
                    }else {
                        var obj={
                            "response":"404"
                        };
                        _cb(null, obj);
                    }
                });
            }

    };//fim findJson()
    
    /**
     * [saveFile save all data salesperson base]
     * @param  {[type]} dataModels  [dataModels]
     * @param  {[type]} value  [value]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.saveFile = function (dataModels, value,_cb) {
        
		

                var dataSalesperson = [];
                //open file 
                function getDataFile(value) {
                    return new Promise(function (resolve, reject) {
                        //get all data xls
                        excelParser.parse({
                            inFile: path.resolve(__dirname, "../../../server/storage/salesperson/" + value),
                            worksheet: 1
                        }, function (err, data) {

                            if (err)
                                resolve("FALSE");
                            resolve(data);
                        });
                    });
                }
        
                //creat object for insert database    
                function objectSalesperson(value) {
                    return new Promise(function (resolve, reject) {
                        getSalesperson(1, value, resolve);
                    });
                }
        
                //get database leadtime    
                function getSalesperson(index, data, resolve) {
                    var salt = bcrypt.genSaltSync(10);
                    //object
                        var salesperson={
			  "salespersonId": 0,
			  "name": "string",
			  "createdAt": "2017-10-07T15:19:54.505Z",
			  "enabled": 0,
			  "groupPermissionsUsersId": 0,
                          "registry":"string",
                          "companyId": null
			};
                          var groupPermissions ={
				  "groupPermissionsId": 0,
				  "name": "string",
				  "description": "string",
				  "hidden": 0
			};
                       var groupPermissionsUsers={
                            "groupPermissionsUsersId": 0,
			    "groupPermissionsId": 0,
			    "login": "string",
			    "password": "string",
			    "creatdAt": "2017-10-07T15:19:54.449Z",
			    "firtLogin": 0,
			    "blocked": 0,
			    "enable": 0
                          };
			var model={
                                    "groupPermissionsUsers": groupPermissionsUsers,
                                    "groupPermissions":groupPermissions,
                                    "salesperson":salesperson
                                  };
                         
                    if (index < data.length){        
                        
                        if(data[index].length === 4 
                            && !formating.isNullOrUndefined(data[index][0])
                            && !formating.isNullOrUndefined(data[index][1])
                            && !formating.isNullOrUndefined(data[index][2])
                            && !formating.isNullOrUndefined(data[index][3])){
                            
                            //filter get
                            var where = {
                                      'login': data[index][2],
                                      'registry':data[index][1]
                             };
                            
                            //get salesperson
                            salespersonDao.findSalesperson(dataModels, where, function (err, _retunr) {
                                
                                if (_retunr.length > 0) {
                               	   
                                    var retunr =JSON.stringify(_retunr);
                                    var json =JSON.parse(retunr);
                                     model.groupPermissionsUsers.groupPermissionsUsersId=json[0].groupPermissionsUsersId;
                                     model.groupPermissionsUsers.groupPermissionsId=json[0].groupPermissionsId;
                                     model.groupPermissionsUsers.login=json[0].login;
                                     model.groupPermissionsUsers.password=bcrypt.hashSync(data[index][1]);
                                     model.groupPermissionsUsers.creatdAt=json[0].creatdAt;
                                     model.groupPermissionsUsers.firtLogin=json[0].firtLogin;
                                     model.groupPermissionsUsers.blocked=json[0].blocked;
                                     model.groupPermissionsUsers.enable=data[index][3];

                                     model.salesperson.salespersonId=json[0].salesperson[0].salespersonId;
                                     model.salesperson.name=data[index][0];
                                     model.salesperson.createdAt=json[0].salesperson[0].createdAt;
                                     model.salesperson.enabled=data[index][3];
				     model.salesperson.groupPermissionsUsersId=json[0].salesperson[0].groupPermissionsUsersId;
                                     model.salesperson.registry=json[0].salesperson[0].registry;

                                     model.groupPermissions.groupPermissionsId=json[0].groupPermissions.groupPermissionsId;
                                     model.groupPermissions.name=json[0].groupPermissions.name;
                                     model.groupPermissions.description=json[0].groupPermissions.description;
                                     model.groupPermissions.hidden=json[0].groupPermissions.hidden;
                                    } else {
                               
                                        //model.groupPermissionsUsers.groupPermissionsUsersId = 0;
                                        model.groupPermissionsUsers.groupPermissionsId = 3;
                                        model.groupPermissionsUsers.login = data[index][2];
                                        model.groupPermissionsUsers.password =bcrypt.hashSync(data[index][1], salt);
                                        model.groupPermissionsUsers.creatdAt = moment().format();
                                        model.groupPermissionsUsers.firtLogin = 0;
                                        model.groupPermissionsUsers.blocked = 0;
                                        model.groupPermissionsUsers.enable = data[index][3];

                                       // model.salesperson.salespersonId = 0;
                                        model.salesperson.name = data[index][0];
                                        model.salesperson.creatdAt = moment().format();
                                        model.salesperson.groupPermissionsUsersId = 0;
                                        model.salesperson.enabled =1;
				        model.salesperson.groupPermissionsUsersId=0;
                                        model.salesperson.registry=data[index][1];

                                        model.groupPermissions.groupPermissionsId=3;
                                        model.groupPermissions.name="VENDEDOR";
                                        model.groupPermissions.description="VENDEDOR";
                                        model.groupPermissions.hidden=1;
                                    }
//                                console.log(JSON.stringify(model))
                                dataSalesperson.push(model);
                                //function recursive
                                index++;
                                getSalesperson(index, data, resolve);
                            });
                        }else{
//				console.log(JSON.stringify(model))
                                dataSalesperson.push(model);
                                //function recursive
                                index++;
                                getSalesperson(index, data, resolve);
                        }
                    } else
                    {
                        resolve(dataSalesperson);
                    }
                }
        
                //Strat async 
                function Init(value) {
		    
        
                    async.parallel([
                        /**
                         * Pegar os dados do arquvio para inserir na base
                         * @name Installments
                         * @param {Function} cb [callback]
                         */
                        function getAllDataXLS(cb) {
                            getDataFile(value).then(function (data) {
                                cb(null, data);
                            });
                        }
                    ], function (err, value) {
                       if(value[0] === 'FALSE'){
                            var response={
                                         "count":0,
                                         "success":0,
                                         "fail":[],
                                         "message":"Arquivo incorreto"
                                     };
                           _cb(null, response);
                      
                        }else{
                            objectSalesperson(value[0]).then(function (data) {
                                
				var listCreate = data.filter(function(elem,i,data){
				   
				   if(elem.groupPermissions.groupPermissionsId > 0 && elem.salesperson.salespersonId === 0){
					return elem;
				    }
				});
				var listUpsert = data.filter(function(elem,i,data){
				   if(elem.salesperson.salespersonId > 0){
					return elem;
				    }
				});
                                
                             if (listCreate.length > 0 && listUpsert.length > 0) {
                                 
                                 async.waterfall([
                                        function(callback) {

                                            salespersonDao.transaction(dataModels, listCreate, function (errTran, resTran) {
                                                callback(null, resTran);
                                            });
                                        },
                                        function(model, callback) {
                                            
                                                dataModels.type="update";
                                                salespersonDao.transaction(dataModels, listUpsert, function (errTran, resTran) {
                                                    
                                                        resTran.count+=model.count;
                                                        resTran.success+=model.success;
                                                        if(model.fail.length > 0){ //contem falha de insert
                                                            for(x in model.fail ){
                                                                resTran.fail.push(model.fail[x])
                                                            }
                                                        }
                                                        
                                                        callback(null, resTran);
                                                });
                                             
                                        }

                                    ], function (err, results) {
                                         _cb(null, results);
                                    });
                                 
                             }else if (listCreate.length > 0) {
				
                                salespersonDao.transaction(dataModels, listCreate, function (errTran, resTran) {
				    
                                    if (!resTran)
                                        _cb(null, errTran);
                                    else{
                                        console.log(JSON.stringify(resTran))
					_cb(null, resTran);
                                    }
                                });
			    }else if (listUpsert.length > 0) {
				dataModels.type="update";
				salespersonDao.transaction(dataModels, listUpsert, function (errTran, resTran) {
				    
                                    if (!resTran)
                                        _cb(null, errTran);
                                    else{
//                                        console.log(JSON.stringify(resTran))
					_cb(null, resTran);
                                    }
                                });
                            } else{
                                if(data.length > 0){
                                    var response={
                                        "count":data.length,
                                        "success":0,
                                        "fail":[{"employee":data.employee}]
                                    };
                                    _cb(null, response);
                                }else{
                                    var response={
                                        "count":0,
                                        "success":0,
                                        "fail":[]
                                    };
                                    _cb(null, response);
                               }
			    }
                        });
                      }
                    });
                }
                //start functions
                Init(value);
            }; //fim findJson()
    module.exports = main;


})();