(function () {
    var myApp = angular.module('validation.rule', ['validation'])

    myApp.config(['$validationProvider', function ($validationProvider) {
            var expression = {
                required: function (value) {
                    return !!value;
                },
                email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                number: /^\d+$/,
                cnpj: function (value) {
                    return cnpjVerify(value); // Got to utils.js to see more informations.
                },
                minlength: function (value, scope, element, attrs, param) {
                    return value.length >= param;
                },
                maxlength: function (value, scope, element, attrs, param) {
                    return value.length <= param;
                },
                remote: function (value, scope, element, attrs) {
                    var base = eval("(" + attrs.$$element[0].dataset.value + ")");

                    //get array input
                    var idName = base.nm + "Id";

                    //name model
                    var Model = $validationProvider.getInjector(base.md);

                    //creat objct dinamyc
                    var fields = {}
                    fields[base.nm] = true;

                    var object = {
                        "filter": {
                            "where": {},
                        }
                    };
                    object['filter']["where"][base.nm] = value;
                   Model.find(object,function (result) {
                        var _vl;
                        if (result.length > 0 && parseInt(base.id) > 0) {
                            _vl = result[0][idName] === parseInt(base.id) ? true : false;
                        } else
                            _vl = result.length === 0 ? true : false;


                    });


                },
                naturalnumber: function (value) { //vazio ou números
                    return (value == '' || (value == null) || (value.length == 0) || /^\s+$/.test(value))
                            || /^[0123456789]*$/.test(value);
                },
                fractnumber: function (value) { //vazio ou números
                    return (value == '' || (value == null) || (value.length == 0) || /^\s+$/.test(value))
                            || /^[0123456789,]*$/.test(value);
                }
            };

            var defaultMsg = {
                required: {
                    error: 'Campo de preenchimento obrigatório.'
                },
                email: {
                    error: 'Por favor, introduza um endereço eletrônico válido.'
                },
                number: {
                    error: 'Por favor, introduza um número válido.'
                },
                minlength: {
                    error: 'Por favor, introduza mais caracteres.'
                },
                maxlength: {
                    error: 'Por favor, introduza menos caracteres.'
                },
                remote: {
                    error: 'Por favor, corrija este campo já está em uso.'
                },
                cnpj: {
                    error: 'Por favor, introduza um CNPJ válido.'
                },
                naturalnumber: {
                    error: 'Por favor, introduza um número válido.'
                },
                fractnumber: {
                    error: 'Por favor, introduza um número válido.'
                }
            };

            $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
        }]);
}).call(this);
