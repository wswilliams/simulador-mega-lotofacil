(function () {

    angular.module('app').controller('defaultController', defaultController)

    function defaultController($rootScope, $scope) {
        
        $scope.groupPermissionsId = $rootScope.currentUser.credentials.group_permissions_id[0];
        

    }


})();
