(function () {

    angular.module('app').controller('numberMegaController', numberMegaController);

    function numberMegaController($scope, NumerosMegaSena, $state) {
        $scope.list_testSet=[];
        
        $scope.uniqueArrayNumero=null;
                  
        $scope.showNumeroCrescente = function(){
            NumerosMegaSena.findDiscting().$promise.then(function (results) {
                $scope.list_testSet=results;
                console.log(results)
            });
        }
        $scope.showNumero= function(){
            NumerosMegaSena.finJogos().$promise.then(function (res) {
                $scope.uniqueArrayNumero=res;
            }); 
        }
     
        $scope.showNumeroCrescente();
        $scope.showNumero();
    }

})();
