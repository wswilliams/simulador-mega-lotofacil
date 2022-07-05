var app = angular.module('app');

app.component('forgotPasswordComponent', {
    controller: 'forgotPasswordController',
    templateUrl: './app/components/forgotPassword/index.html',
    bindings: {
        idEdit: '@'
    }  
});