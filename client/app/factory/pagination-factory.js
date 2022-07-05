/**
 * Created Bruno 21/06/2016.
 * factory pagination
 * 
 */
(function (angular) {
    angular.module('app').factory('viewPagination', function ($http, $injector, $filter) {
        /**
         * factory pagination
         * @return values paginations
         */
        return {
            start: function ($scope, order) {
                $scope.page = 0;
                $scope.limit = 10;
                $scope.pagesNumber = 0;
                $scope.lastPage = 0;
                $scope.searchClick = false;
                $scope.nextPrev = false;

                $scope.object = {
                    "filter": {
                        "include": {},
                        "where": {},
                        "order": order,
                        "limit": $scope.limit,
                        "skip": $scope.limit * $scope.page
                    }
                };


                $scope.search = function () {
                    $scope.page = 0;
                    $scope.searchClick = true;
                    $scope.searchPagination($scope.filter.query);
                };

                $scope.loadPage = function () {
                    $scope.searchClick = true;
                    $scope.searchPagination($scope.filter.query);
                };

                $scope.paginationNext = function () {
                    if ($scope.nextPrev === false && $scope.btnNext === false) {
                        $scope.page++;
                        if ($scope.searchClick === false)
                            $scope.searchPagination("");
                        else
                            $scope.searchPagination($scope.filter.query);

                        $scope.nextPrev = true;
                    }
                };

                $scope.paginationStart = function () {
                    if ($scope.page !== 0) {
                        $scope.page = 0;
                        if ($scope.searchClick === false)
                            $scope.searchPagination("");
                        else
                            $scope.searchPagination($scope.filter.query);
                    }
                };
                $scope.clearQuery = function () {
                    $scope.searchClick = false;
                    Object.keys($scope.filter['query']).forEach(function (key) {
                        $scope.filter['query'][key] = "";
                    });

                    $scope.object['filter']['where'] = {};
                    $scope.searchPagination("");
                }; //fim function


                $scope.paginationStop = function () {
                    var totalPage = $scope.lastPage - 1;
                    if ($scope.page !== totalPage) {
                        $scope.page = totalPage;

                        if ($scope.searchClick === false)
                            $scope.searchPagination("");
                        else
                            $scope.searchPagination($scope.filter.query);
                    }
                };

                $scope.paginationPrev = function () {
                    if ($scope.nextPrev === false && $scope.btnPrev === false) {
                        $scope.page--;
                        if ($scope.searchClick === false)
                            $scope.searchPagination("");
                        else
                            $scope.searchPagination($scope.filter.query);

                        $scope.nextPrev = true;
                    }
                };


                $scope.paginationNumber = function (number) {
                    if ($scope.page !== number) {
                        if ($scope.nextPrev === false) {
                            $scope.page = number;
                            if ($scope.searchClick === false)
                                $scope.searchPagination("");
                            else
                                $scope.searchPagination($scope.filter.query);

                            $scope.nextPrev = true;
                        }
                    }
                };

                $scope.generatePagesNumber = function () {
                    var curr = $scope.page;
                    var arr = [];
                    var total = $scope.lastPage;
                    var max = 5;

                    // generating pagination index
                    for (var i = 0; i < total; i++)
                        arr.push(i + 1);

                    var mEnd = curr + max;
                    var offset = mEnd - total;
                    if (offset < 0) {
                        offset = 0;
                    }
                    mEnd = mEnd > total ? total : mEnd;
                    var mStart = curr - offset > 0 ? curr - offset : 0;
                    arr = arr.slice(mStart, mEnd);

                    return arr;
                };


                $scope.calcPagination = function ($scope, results, count) {

                    var math = Math.ceil(count / $scope.limit);

                    var page = $scope.page > 0 ? $scope.page + 1 : 1;
                    if (math === 0)
                        var paeTotal = count;
                    else {
                        if (($scope.limit * page) >= count)
                            var paeTotal = count;
                        else
                            var paeTotal = page < math ? ($scope.limit * page) : ($scope.limit * page) + Math.abs(($scope.limit * page) - count.length);
                    }

                    math = math > 0 ? math : 1;
                    $scope.btnNext = page < math ? false : true;
                    $scope.btnPrev = page === 1;
                    $scope.lastPage = math;
                    $scope.list = results.length > 0 ? results : [];
                    $scope.nextPrev = false;
                    
                    if ($scope.list.length > 0) {
                        $scope.pagesNumber = $scope.generatePagesNumber();
                        $scope.resultSearchMsg = "Exibindo " + Math.abs(paeTotal) + " de " + count + " registro(s)";
                        return $scope.list;
                    } else {
                        $scope.resultSearchMsg = "Não foram encontrados registros.";
                    }
                }

                $scope.pagination = function (modelBase, $scope, _return) {
                    var model = $injector.get(modelBase);
                    $scope.object['filter']['skip'] = $scope.limit * $scope.page;
                    model.find($scope.object).$promise.then(function (results) {
                        
                        model.find({'filter': {'where': $scope.object['filter']["where"]}}).$promise.then(function (_returnCount) {
                            var call = $.Callbacks();
                            call.add(_return);
                            call.fire(results);
                            //calc pagination
                            $scope.calcPagination($scope, results, _returnCount.length);
                        });

                    });

                }
                /**
                 * Foi criada para trabalhar com Query feita nas models 
                 * Parâmetros:
                 * skip : serve para a paginação
                 * limit : determina o número de dados que vai retorna
                 * where : para desenvolver a pesquisa na query
                 * 
                 * caso queira passar outros parâmetros como order 
                 * 
                 * $scope.object['filter']['order'] ou $scope.object['filter']['and'] = esse parâmetros 
                 * fica a seu criterio de uso para pegar no metodo remote 
                 * 
                 */
                $scope.paginationRemote = function (modelBase, $scope, _return) {
                    var model = $injector.get(modelBase);
                    $scope.object['filter']['skip'] = $scope.limit * $scope.page;
                    model.findRemote($scope.object, function (results) {
                        
                        model.findRemoteCount({'filter': {'where': $scope.object['filter']["where"]}}, function (count) {
                            
                            var call = $.Callbacks();
                            call.add(_return);
                            call.fire(results);
                            //calc pagination
                            
                            if(modelBase === "PurchaseOrder"){
                               
                                $scope.calcPagination($scope, results['return'], count['return'].length);
                            }else    
                              $scope.calcPagination($scope, results['return'], count['return'][0]['count']);
                        });

                    });
                    
                    function isNullOrUndefined (object) {
                        return typeof(object) === 'undefined' || object === undefined || object === null || object === "";
                   }

                }
            }

        }
    });
})(angular);
