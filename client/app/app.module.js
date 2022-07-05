var app = angular.module('app',
        [
            'ui.router',
            'lbServices',
            'validation',
            'angular-loading-bar',
            'validation.rule',
            'angularFileUpload',
            'ngFileUpload',
            '720kb.datepicker'
        ]);




app.config(function ($stateProvider, $urlRouterProvider, $urlServiceProvider, $httpProvider, LoopBackResourceProvider, $locationProvider) {


    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true)

    var sp = $stateProvider;


    sp.state('default', {
        parent: 'auth',
        url: '/',
        component: 'defaultComponent'
    })


    sp.state('guest', {
        abstract: true,
        templateUrl: './app/layouts/login.html',
        controller: function ($scope) {
        }
    });


    sp.state('login', {
        parent: 'guest',
        url: '/login',
        component: 'loginComponent'
    });

    sp.state('logout', {
        url: '/logout',
        resolve: {
            logout: function (AuthService) {
                AuthService.logout();
            }
        }
    });


    sp.state('auth', {
        abstract: true,
        templateUrl: './app/layouts/auth.html',
        resolve: {
            authorize: function (AuthService) {
                AuthService.authorize();
            }
        },
        controller: function ($scope) {
            //$scope.contacts = [{id: 0, name: "Alice"}, {id: 1, name: "Bob"}];
        }
    })
 
    sp.state('home', {
        parent: 'auth',
        url: '/home',
        component: 'homeComponent'
    })
    .state('facil', {
        parent: 'auth',
        url: '/facil',
        component: 'lotoFacilAddComponent'
    })
    .state('mega', {
        parent: 'auth',
        url: '/mega',
        component: 'megaSenaAddComponent'
    })
    .state('number-facil', {
        parent: 'auth',
        url: '/number-facil',
        component: 'numberFacilComponent'
    })
    .state('number-mega', {
        parent: 'auth',
        url: '/number-mega',
        component: 'numberMegaComponent'
    });

    // Use a custom auth header instead of the default 'Authorization'
    LoopBackResourceProvider.setAuthHeader('X-Access-Token');

    // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase('/api');

    // Inside app config block
    $httpProvider.interceptors.push(function ($q, $location, LoopBackAuth) {
        return {
            responseError: function (rejection) {
              
                if (rejection.status == 401) {
                    location.href = '/login';
                    LoopBackAuth.clearUser();
                    LoopBackAuth.clearStorage();
                }

                return $q.reject(rejection);
            }
        };
    });




});


app.run(['$rootScope', 'User', 'AuthService', 'LoopBackAuth',
    function ($rootScope, User, AuthService, LoopBackAuth) {
        $rootScope.currentUser = {}

        if (User.isAuthenticated()) {
            User.getCurrent().$promise.then(function (data) {
                $rootScope.currentUser = {id: data.id, credentials: data.credentials};
            });

        }


    }
]);
