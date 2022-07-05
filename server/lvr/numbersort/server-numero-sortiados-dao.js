(function () {
    'use strict';

    var main = {};
    var Promise = require('bluebird');
    var async = require('async');
    var moment = require('moment');


    /**
     * [transaction transacao para insercao  e update ]
     * @param  {[type]} app    [models (Product)]
     * @param  {[type]} values [{Product:dados }]
     * @param  {[type]} _cb    [callback]
     * @return {[type]}        [boolean]
     */
    main.transaction = function (app, values, _cb) {
        var context = this,
                NumerosSortiados= app.NumerosSortiados,
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

        NumerosSortiados.beginTransaction({}, function (err, tx) {
            options = {transaction: tx};
            
            switch (app.type) {
                case 'save':
                    salvar(values, options);
                    break;
                case 'count':
                    countUpdate(values, options);
                    break;
                default :
                    errorHandler('FALSE');
                    break;
            }


        });

        /**
         * [savePrice realiza create number, 
         * @param  {[type]} values [{number:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        
        var salvar = function (values, options) {
            //data Model 
            var response={
		         "count":0,
             "success":0,
			 "fail":[]
                     };
             var countL=0;
             
            function saveSortNumber(test, callback) {
                
                async.eachSeries(test, function (element, callback) {
                    response.count++;
                        NumerosSortiados.upsert(element, options, function (err, item) {
                           
                        if (err === null){
                            response.success++;
                            callback();
                        }else{
                            response.fail.push({
                                            count:countL++,
                                            data:element
                                        });
                            callback('false');
                        }
                    });

                }, function (value) {
                    callback(value);
                });

            }

            //Strat async 
            function Init(value) {
                
                async.waterfall([
                    
                    function(callback) {
                            saveSortNumber(value, function (test) {
                                callback(null,test);
                            });
                    }

                ], function (err, results) {
                    
                    if (results === 'false') {
                        
                        errorHandler(response);
                    } else {
                        context.commit(response, options.transaction);
                    }
                });

            }
            //start functions
            Init(values);
        };

         /**
         * [countUpdate realiza , 
         * @param  {[type]} values [{number:dados }]
         * @param  {[type]} options [options da transaction]
         * @return {[type]}         [boolean]
         */
        
        var countUpdate = function (values, options) {
            //data Model 
            var response={
		         "count":0,
             "success":0,
			 "fail":[]
                     };
             var countL=0;
             
            function countNumber(test, callback) {
                
                async.eachSeries(test, function (element, callback) {
                    response.count++;
                   
                    var query = {
                            numero: element.numero
                    };

                    NumerosSortiados.count(query, function (err, itemCount) {
      
                        element.qtd=itemCount;

                        NumerosSortiados.upsert(element, options, function (err, item) {
                            
                            if (err === null){
                                response.success++;
                                callback();
                            }else{
                                response.fail.push({
                                                count:countL++,
                                                data:element
                                            });
                                callback('false');
                            }
                        });
                    });

                }, function (value) {
                    callback(value);
                });

            }

            //Strat async 
            function Init(value) {
                
                async.waterfall([
                    
                    function(callback) {
                            countNumber(value, function (test) {
                                callback(null,test);
                            });
                    }

                ], function (err, results) {
                    
                    if (results === 'false') {
                        
                        errorHandler(response);
                    } else {
                        context.commit(response, options.transaction);
                    }
                });

            }
            //start functions
            Init(values);
        };
    };


    module.exports = main;

})();
