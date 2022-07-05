(function () {

    angular.module('app').controller('versionController', function ($rootScope, $scope, AuthService, GroupPermissionsUsers) {
      $scope.appVersion = "";

      $scope.getVersion = function () {
        GroupPermissionsUsers.getAplicationVersion().$promise.then(function (results) {

              if (results.version !== undefined) {
                  $scope.appVersion = " v." + results.version;
              } else {
                  $scope.appVersion = "";
              }
          });
      }

      $scope.getVersion();

    })

})();
