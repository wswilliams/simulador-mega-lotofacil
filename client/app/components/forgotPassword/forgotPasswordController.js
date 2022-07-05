(function () {

    angular.module('app').controller('forgotPasswordController',
            function ($rootScope, $rootScope, ForgotPassword, $scope, Message, $injector) {

                var $validationProvider = $injector.get('$validation');
                $scope.credentials = $rootScope.currentUser.credentials;

                $scope.form = {login: ''}
                $scope.loading = false

                $ctrl = this



                $rootScope.forgotPasswordOpen = function () {
                    $scope.form = {}

                    $('#modalForgotPassword').modal('show')

                }


                $scope.save = function () {
                    $scope.loading = true
                    var q = {
                        "login": $scope.login
                    }
                    ForgotPassword.recoverPassword(q)
                            .$promise
                            .then(function (res) {
                                $scope.loading = false
                                if (res.response == 404) {
                                    Message.CUSTOM('E-mail inexistente.', 'error');
                                } else {
                                    $('#modalForgotPassword').modal('hide')
                                    Message.CUSTOM('Uma nova senha foi enviada para seu e-mail.', 'success');
                                }
                            })
                            .catch(function () {
                                Message.CUSTOM('E-mail inexistente.', 'error');
                            })
                }

            });
}
)();





