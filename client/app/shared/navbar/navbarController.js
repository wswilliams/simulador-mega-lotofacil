(function () {

    angular.module('app').controller('navbarController', function ($rootScope, $scope, AuthService) {

        var credentials = $scope.credentials = $rootScope.currentUser.credentials;




        function permission(permissions_ids){
           
            return permissions_ids.includes(credentials.group_permissions_id[0])
        }

        $scope.menu = [
            {
                label: 'Home',
                hide: !permission([1]),
                sref: "home"
            },
            {
                label: 'Upload Aquivos',
                hide: !permission([1]),
                sub: [
                    {
                        label: 'Loto Facil',
                        sref: "facil"
                    },
                    {
                        label: 'Mega Sena',
                        sref: "mega"
                    },
                ]
            },
            {
                label: 'Numeros Gerados',
                hide: !permission([1]),
                sub: [
                    {
                        label: 'Loto Facil',
                        sref: "number-facil"
                    },
                    {
                        label: 'Mega Sena',
                        sref: "number-mega"
                    },
                ]
            }
          ]


        $scope.logout = function () {
            AuthService.logout();
        }

        $scope.editPass = function () {
            $('#modalUserEditPass').modal('show')
        }

    })

})();
