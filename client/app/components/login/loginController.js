
var app = angular.module('app');

app.controller('loginController', loginController)
     //   .controller('AuthLogoutController', AuthLogoutController)
       // .controller('AuthLoginEditController', AuthLoginEditController)
        //.controller('EditLoginController', EditLoginController);
        


function loginController($scope, $rootScope, AuthService, Message, $injector, $state) {
    var $validationProvider = $injector.get('$validation');

    $scope.form = {
        submit: function (form) {
            $validationProvider.validate(form)
                    .success(function () {
                        AuthService.login($scope.form, function (result) {

                            if (result.data.authorized) {
                               $state.go('default')
                            } else {
                                Message.CUSTOM('Dados incorretos!', 'error');
                            }
                        }, function () {
                            
                            Message.CUSTOM('Dados incorretos!', 'error');
                        });

                    })
                    .error(function () {
                        Message.CUSTOM('Dados incorretos!', 'error');
                    });
        }
    };
    
    
    $scope.forgotPassword = function(){
        console.log($rootScope);
        $rootScope.forgotPasswordOpen();
    }

}

