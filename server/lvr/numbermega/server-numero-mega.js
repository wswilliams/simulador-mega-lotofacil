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
            sortNumberDao = require('./server-numero-mega-dao.js');


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
     * [findCoutNumber return all data NumerosMegaSena]
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
              
                dataModels.NumerosMegaSena.find({},function(err, list) {
                    if (list.length > 0) {
                        callback(list);
                    }else{
                        callback(null);
                    }
                });
            };
           

    }; //fim findJson()

    /**
     * [finJogos return all data NumerosMegaSena]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.finJogos = function(dataModels, app, _cb) {
        var ds = dataModels.NumerosMegaSena.dataSource;
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
                            for(var x =0; x < 2; x++){
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
                            for(var x =0; x < 3; x++){
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
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-mega.sql')).toString();
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
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-mega.sql')).toString();
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
                listsetD: [],
                listsetE: [],
                listsetAB: [],
                listsetAC: [],
                listsetAD: [],
                listsetAE: [],
                listsetBC: [],
                listsetBD: [],
                listsetBE: [],
                listsetCD: [],
                listsetCE: [],
                listsetDE: [],
            };           
          
            // list A
            function getRandomArbitrary(listA) {
                var x = Math.random() * (60 - 1) + 1;
                x = Math.trunc(x);
                
                if(listA.length > 0){
                    if(listA.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }else{
                    if(listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }
            }
            //list B
            function getRandomArbitrarySetB(listA,listB) {
                var x = Math.random() * (60 - 1) + 1;
                x = Math.trunc(x);
                if(listB.length > 0){
                    if(listA.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false && listB.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }else{
                    if(listA.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }
            }//list C
            function getRandomArbitrarySetC(listA,listB,listC) {
                var x = Math.random() * (60 - 1) + 1;
                x = Math.trunc(x);
                if(listC.length > 0){
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false && listC.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }else{
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }
            }
            //list D
            function getRandomArbitrarySetD(listA,listB,listC,listD) {
                var x = Math.random() * (60 - 1) + 1;
                x = Math.trunc(x);
                if(listC.length > 0){
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listC.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false && listD.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }else{
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listC.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }
            }
            //list E
            function getRandomArbitrarySetE(listA,listB,listC,listD,listE) {
                var x = Math.random() * (60 - 1) + 1;
                x = Math.trunc(x);
                if(listC.length > 0){
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listC.indexOf(x) == false && listD.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false && listE.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }else{
                    if(listA.indexOf(x) == false && listB.indexOf(x) == false && listC.indexOf(x) == false && listD.indexOf(x) == false && listNumber.numberFixAux.indexOf(x) == false){
                        return x;
                    }else{
                        return  Math.trunc(Math.random() * (60 - 1) + 1);
                    }
                }
            }
            // conjunto A
            arrayList.listsetA.push(getRandomArbitrary(arrayList.listsetA));
            arrayList.listsetA.push(getRandomArbitrary(arrayList.listsetA));
            // conjunto B
            arrayList.listsetB.push(getRandomArbitrarySetB(arrayList.listsetA,arrayList.listsetB));
            arrayList.listsetB.push(getRandomArbitrarySetB(arrayList.listsetA,arrayList.listsetB));
            // conjunto C
            arrayList.listsetC.push(getRandomArbitrarySetC(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC));
            arrayList.listsetC.push(getRandomArbitrarySetC(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC));
            // conjunto D
            arrayList.listsetD.push(getRandomArbitrarySetD(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC,arrayList.listsetD));
            arrayList.listsetD.push(getRandomArbitrarySetD(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC,arrayList.listsetD));
            // conjunto E
            arrayList.listsetE.push(getRandomArbitrarySetE(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC,arrayList.listsetD,arrayList.listsetE));
            arrayList.listsetE.push(getRandomArbitrarySetE(arrayList.listsetA,arrayList.listsetB,arrayList.listsetC,arrayList.listsetD,arrayList.listsetE));
           

            for(var z = 0; z < 2; z++){
                // conjunto A B
                arrayList.listsetAB.push(arrayList.listsetA[z]);
                arrayList.listsetAB.push(arrayList.listsetB[z]);
                // conjunto A C
                arrayList.listsetAC.push(arrayList.listsetA[z]);
                arrayList.listsetAC.push(arrayList.listsetC[z]);
                // conjunto A D
                arrayList.listsetAD.push(arrayList.listsetA[z]);
                arrayList.listsetAD.push(arrayList.listsetD[z]); 
                // conjunto A E
                arrayList.listsetAE.push(arrayList.listsetA[z]);
                arrayList.listsetAE.push(arrayList.listsetE[z]);
                // conjunto B C
                arrayList.listsetBC.push(arrayList.listsetB[z]);
                arrayList.listsetBC.push(arrayList.listsetC[z]);
                // conjunto B D
                arrayList.listsetBD.push(arrayList.listsetB[z]);
                arrayList.listsetBD.push(arrayList.listsetD[z]);
                // conjunto B E
                arrayList.listsetBE.push(arrayList.listsetB[z]);
                arrayList.listsetBE.push(arrayList.listsetE[z]);
                // conjunto C D
                arrayList.listsetCD.push(arrayList.listsetC[z]);
                arrayList.listsetCD.push(arrayList.listsetD[z]);
                // conjunto C E
                arrayList.listsetCE.push(arrayList.listsetC[z]);
                arrayList.listsetCE.push(arrayList.listsetE[z]);
                // conjunto D E
                arrayList.listsetDE.push(arrayList.listsetD[z]);
                arrayList.listsetDE.push(arrayList.listsetE[z]);
            }

            for(var i = 0; i < listNumber.numberFix.length; i++){
               
                arrayList.listsetAB.push(listNumber.numberFix[i].numero);
                arrayList.listsetAC.push(listNumber.numberFix[i].numero);
                arrayList.listsetAD.push(listNumber.numberFix[i].numero);
                arrayList.listsetAE.push(listNumber.numberFix[i].numero);
                arrayList.listsetBC.push(listNumber.numberFix[i].numero);
                arrayList.listsetBD.push(listNumber.numberFix[i].numero);
                arrayList.listsetBE.push(listNumber.numberFix[i].numero);
                arrayList.listsetCD.push(listNumber.numberFix[i].numero);
                arrayList.listsetCE.push(listNumber.numberFix[i].numero);
                arrayList.listsetDE.push(listNumber.numberFix[i].numero);
            }
            callback(arrayList);
        }
        
}; //fim findJson()

    /**
     * [findDiscting return all data NumerosMegaSena]
     * @param  {[type]} app  [model]
     * @param  {[type]} _cb  [callback]
     * @return {[type]}      [object]
     * return data type json
     */
    main.findDiscting = function(dataModels, app, _cb) {
        var ds = dataModels.NumerosMegaSena.dataSource;
            var sql = fs.readFileSync(path.resolve(__dirname, 'sql/sql-numero-mega-asc.sql')).toString();
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