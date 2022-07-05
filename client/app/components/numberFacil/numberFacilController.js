(function () {

    angular.module('app').controller('numberFacilController', numberFacilController);

    function numberFacilController($scope, NumerosSortiados, $state) {
        $scope.list_testSet=[];
        
        $scope.uniqueArrayNumero=null;
                  
        $scope.showNumeroCrescente = function(){
            NumerosSortiados.findDiscting().$promise.then(function (results) {
                $scope.list_testSet=results;
            });
        }
        $scope.showNumero= function(){
            NumerosSortiados.finJogos().$promise.then(function (res) {
                $scope.uniqueArrayNumero=res;
            }); 
        }
     
        $scope.showNumeroCrescente();
        $scope.showNumero();
    }

})();
