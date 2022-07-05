(function () {
    'use strict';

    // Módulos externos
    var fs = require('fs');
    var path = require('path');
    var moment = require('moment');
    var Promise = require('bluebird');
    var async = require('async');
    var excelParser = require('excel-parser');
    var formating = require('../utils/format.js');

    var main = {},
            sortNumberDao = require('./server-numero-sortiados-dao.js');


    /**
     * [saveFile save all data price promotional base]
     * @param  {[type]} dataModels  [dataModels]
     * @param  {[type]} value  [value]
     * @param  {[type]} _cb  [callback]
     * return TRUE / FALSE
     */
    main.saveFile = function (dataModels, value, _cb) {

        var objectReturn = [];
        //open file 
        function getDataFile(value) {
            return new Promise(function (resolve, reject) {
                //get all data xls
                excelParser.parse({
                    inFile: path.resolve(__dirname, "../../../server/storage/lotofacil/" + value),
                    worksheet: 1
                }, function (err, data) {
                    
                    if (err)
                        resolve("FALSE");
                    resolve(data);
                });

            });
        }

        function objectPrice(sortNumber) {
          
            var dataSort = [];
            return new Promise(function (resolve, reject) {
                var keys = Object.keys(sortNumber);
                getPrice(1, keys, sortNumber, resolve);
            });
            function getPrice(index, keys, data, resolve) {
                if (index < keys.length) {
                    //filter
                   
                    var object = data[index];
                    
                    var newProduct={
                        "id":data[index][0],
                        "numero": data[index][1],
                        "qdt": 0
                      }
                    dataSort.push(newProduct);
                    
                        //function recursive
                        index++;
                        getPrice(index, keys, data, resolve);
                    
                }else{
                    resolve(dataSort);
                }
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
                
                    async.waterfall([
                        function(callback) {
                            
                            objectPrice(value[0], dataModels).then(function (data) {
                                if (data.length > 0) {
                                    callback(null, data);
                                }else
                                    callback(null, "FALSE");
                            });
                        },
                        function(data, callback) {
                            
                            sortNumberDao.transaction(dataModels, data, function (errTran, resTran) {
                               
                                    if (errTran === null) {
                                        
                                        var response ={
                                            "message": data.length == 1 ? "Salvo com sucesso" : "Foram processados com sucesso de itens "+ data.length+ " da lista!",
                                            "list":resTran.count
                                        }                                        
                                        callback(null, response);
                                    } else {
                                        
                                        callback(null, errTran);
                                    }
                                });
                        }
                    ], function (err, result) {
                        // result now equals 'done'
                        _cb(null, result);
                    });
                   
            });
        }
        //start functions
        Init(value);
    };//fim findJson()


    /**
     * [findCoutNumber return all data NumerosSortiados]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.findCoutNumber = function(dataModels, app, _cb) {
        var obj={};
            //Strat async
            function Init(value) {

                async.waterfall([
                    function(callback) {
                        findNumberList(dataModels, function (res) {
                                callback(null,res);
                            });
                    }
                ], function (err, results) {
                    
                    if(formating.isNullOrUndefined(results)){
                        obj.response = "404";
                        _cb(null, obj);
                    }else{
                        dataModels.type="count";
                        sortNumberDao.transaction(dataModels, results, function (errTran, resTran) {
                               
                            _cb(null, resTran);
                        });
                        
                    }
                });

            }
            //start functions
            Init(dataModels);

            function findNumberList(dataModels, callback){
              
                dataModels.NumerosSortiados.find({},function(err, list) {
                    if (list.length > 0) {
                        callback(list);
                    }else{
                        callback(null);
                    }
                });
            };
           

    }; //fim findJson()

    /**
     * [finJogos return all data NumerosSortiados]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.finJogos = function(dataModels, app, _cb) {
        var ds = dataModels.NumerosSortiados.dataSource;
        var obj={};
        //Strat async
        function Init(value) {

            async.waterfall([
                function(callback) {
                    findNumberFix(dataModels, function (res) {
                        var result ={
                            listNumberFix: [],
                            listNumberFixAux:[]
                        };
                            for(var x =0; x < 5; x++){
                                result.listNumberFix.push(res[x]);
                                result.listNumberFixAux.push(parseInt(res[x].numero));
                            }
                            callback(null,result);
                        });
                },
                function(fix,callback) {
                    findNumberOut(dataModels, function (res) {
                        var result ={
                            listNumberOut:[],
                            listNumberOutAux:[]
                        };
                        for(var x =0; x < 2; x++){
                            result.listNumberOut.push(res[x]);
                            result.listNumberOutAux.push(parseInt(res[x].numero));
                        }

                        var result ={
                            numberFix: fix.listNumberFix,
                            numberFixAux: fix.listNumberFixAux,
                            numberOut: result.listNumberOut,
                            numberOutAux: result.listNumberOutAux
                        }
                            callback(null,result);
                        });
                },
                function(result,callback) {
                    if(formating.isNullOrUndefined(result.numberFix[0])){
                        callback(null,null);
                    }else{
                        mountSet(result, function (res) {
                            var results ={
                                numberFix: result.numberFix,
                                numberOut: result.numberOut,
                                listSet:   res
                                }
                                callback(null,results);
                            });
                    }
                }
            ], function (err, results) {
                
                if(formating.isNullOrUndefined(results)){
                    obj.response = "404";
                    _cb(null, obj);
                }else{
                    _cb(null, results);
                   
                }
            });

        }
        //start functions
        Init(dataModels);

        function findNumberFix(dataModels, callback){
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-sortiados.sql')).toString();
            sql = formating.format(sql, "DESC");
            ds.connector.query(sql, function (err, res) {
                if (err) {
                    callback(null);
                } else {
                    callback(res);
                }
            });
        };
        function findNumberOut(dataModels, callback){
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-sortiados.sql')).toString();
            sql = formating.format(sql, "ASC");
            ds.connector.query(sql, function (err, res) {
                if (err) {
                    callback(null);
                } else {
                    callback(res);
                }
            });
        };
        function mountSet(listNumber, callback){
            var arrayList={
                listsetA: [],
                listsetB: [],
                listsetC: [],
                listsetAB: [],
                listsetAC: [],
                listsetBC: []
            };           
              
            for(var x = 1; x < 25; x++){ // conjunto A

               if(listNumber.numberFixAux.indexOf(x) == -1 && listNumber.numberOutAux.indexOf(x) == -1){
                       arrayList.listsetA.push(x);
                       arrayList.listsetAB.push(x);
                       arrayList.listsetAC.push(x);      
                }
                if(arrayList.listsetA.length == 5){
                    break;
                }
            }
            for(var x = 1; x < 25; x++){// conjunto B
                if(listNumber.numberFixAux.indexOf(x) == -1 && listNumber.numberOutAux.indexOf(x) == -1
                    && arrayList.listsetA.indexOf(x) == -1){

                        arrayList.listsetB.push(x);
                        arrayList.listsetAB.push(x);
                        arrayList.listsetBC.push(x);
                }
                if(arrayList.listsetB.length == 5){
                    break;
                }
            }
            for(var x = 1; x < 25; x++){// conjunto C
                if(listNumber.numberFixAux.indexOf(x) == -1 && listNumber.numberOut.indexOf(x) == -1
                    && arrayList.listsetA.indexOf(x) == -1 && arrayList.listsetB.indexOf(x) == -1){
                        arrayList.listsetC.push(x);
                        arrayList.listsetAC.push(x);
                        arrayList.listsetBC.push(x);
                }
                if(arrayList.listsetC.length == 5){
                    break;
                }
            }
            for(var i = 0; i < listNumber.numberFix.length; i++){
                arrayList.listsetAB.push(listNumber.numberFixAux[i]);
                arrayList.listsetAC.push(listNumber.numberFixAux[i]);
                arrayList.listsetBC.push(listNumber.numberFixAux[i]);
            }
            callback(arrayList);
        }
        
}; //fim findJson()

    /**
     * [findDiscting return all data NumerosSortiados]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.findDiscting = function(dataModels, app, _cb) {
        var ds = dataModels.NumerosSortiados.dataSource;
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-sortiados-asc.sql')).toString();
            sql = formating.format(sql, "ASC");
            ds.connector.query(sql, function (err, res) {
                if (err) {
                    _cb(null);
                } else {
                    if(res.length > 0){
                        _cb(res);
                    }else{
                        _cb({"response": '404'});
                    }
                }
            });
    }; //fim findJson()

    module.exports = main;


})();