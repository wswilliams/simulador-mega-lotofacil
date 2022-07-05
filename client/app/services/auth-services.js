(function (angular) {

    angular.module('app').factory('AuthService', AuthService);

    function AuthService($http, $rootScope, User, LoopBackAuth, $state) {
        /**
         * Envia um requisição POST para /register indicando que uma intenção
         * de login está sendo requisitada.
         * @param user Objeto contendo as credenciais do usuário:  e-mail, password, groupPermissionsId
         * @param successCallback Callback de sucesso
         * @param errorCallback Callback de erro
         */
        function login(user, successCallback, errorCallback) {
            var request = {
                method: "post", url: "/register", data: {
                    email: user.email,
                    password: user.password
                }
            };

            $http({
                method: request.method,
                url: request.url,
                data: request.data
            }).then(function (response) {
                if (response.data.authorized) {
                    var accessToken = response.data.token;
                    // Local Storage
                    localStorage.setItem('currentUser', JSON.stringify({userId:accessToken.userId,id: response.id, credentials: accessToken.user.credentials, password: response.data.password}));
                    LoopBackAuth.setUser(accessToken.id, accessToken.userId, accessToken.user);
                    LoopBackAuth.rememberMe = true;
                    LoopBackAuth.save();

                    var data = response.data.token.user;
                    $rootScope.currentUser = {id: data.id, credentials: data.credentials};

                    successCallback(response);
                } else if (response.data.error) {
                    errorCallback(response)
                }

            }, function (response) {
                successCallback(response);
            });
        }


        /**
         * Logout
         */
        function logout() {
//            var pageRedirect = "/";
            var retrievedObject = localStorage.currentUser;
            var currentUser = JSON.parse(retrievedObject);
            
            var request = {
                method: "get", url: "/logout/"+currentUser.userId
            };
            $http({
                method: request.method,
                url: request.url
            }).then(function (response) {
                //clear session 
                localStorage.clear();
                $state.go('login');

            }, function (response) {
                //clear session 
                
                localStorage.clear();
                $state.go('login');
            });
          }



        /**
         * Authorize check
         */
        function authorize() {
            if (!User.isAuthenticated()) {
                $state.go('login')
            } else {
                return true;
            }
        }


        return {login: login, logout: logout, authorize: authorize};
    }


})(angular);