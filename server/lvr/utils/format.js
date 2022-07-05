/**
 * Created by Richard Lopes on 20/11/2015.
 */

(function () {
    'use strict';

    var utils = {};
    //var winston = require('winston');

    /**
     * Usando uma string tida como máscara, substitui
     * a ocorrência do caractere % por uma string no parâmetro da função
     * na posição respectiva à ocorrência do caractere.
     * %param mask Máscara
     * %param String[] Array de strings
     * @returns {*}
     */
    utils.format = function () {
        var options = this.options || {};
        if (arguments.length > 1) {
            var string = arguments[0];
            if (typeof options.repeat === 'undefined') {
                for (var i = 1; i < arguments.length; i++) {
                    var argument = arguments[i];
                    string = string.replace('%', argument);
                }
            } else {
                options.repeat = options.repeat || 0;
                argument = arguments[options.repeat + 1];
                while (string.indexOf('%') >= 0) {
                    string = string.replace('%', argument);
                }
            }
            return string;
        }
        return arguments[1] || null;
    };

    /**
     * Usando uma string tida como máscara, substitui
     * a ocorrência do caractere % por uma string no parâmetro da função
     * na posição respectiva à ocorrência do caractere.
     * %param mask Máscara
     * %param String[] Array de strings
     * @returns {*}
     */
    utils.formatLike = function () {
        var options = this.options || {};
        if (arguments.length > 1) {
            var string = arguments[0];
            if (typeof options.repeat === 'undefined') {
                for (var i = 1; i < arguments.length; i++) {
                    var argument = arguments[i];
                    string = string.replace('#', argument);
                }
            } else {
                options.repeat = options.repeat || 0;
                argument = arguments[options.repeat + 1];
                while (string.indexOf('#') >= 0) {
                    string = string.replace('#', argument);
                }
            }
            return string;
        }
        return arguments[1] || null;
    };

    /**
     * Define as opções para a opção de format
     * @param options
     *      - repeat: índice do elemento a ser repetido em todas as ocorrências
     * @returns {{run: Function}}
     */
    utils.format.options = function (options) {
        return {
            run: function () {
                options = options || {};
                return utils.format.apply({options: options}, arguments);
            }
        };
    };

    /**
     * Represents element as array, in case it is not an array already
     * @param target Object or Array
     * @returns {*}
     */
    utils.asArray = function (target) {
        if (typeof target === 'undefined')
            return [];
        if (Array.isArray(target)) {
            return target;
        } else if (typeof target === 'function') {
            var attr, child;
            try {
                attr = target().attr;
                child = target().child;
                return attr[child] ? attr[child] : attr;
            } catch (e) {
                return target()[0];
            }
        }
        return [target];
    };

    /**
     * Algoritmo para replace, similar ao C#
     * Utilizando chaves {} e um índice. Exemplo:
     *      format('{0}-{1}', 'a','b');
     *      Resultado: 'a-b'
     *
     */
    utils.format2 = function () {
        var string = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length > 0) {
            return string.replace(/{(\d+)}/g, function (match, number) {
                var mNumber = parseInt(number);
                return typeof args[mNumber] !== 'undefined' ? args[mNumber] : match;
            });
        }
    };

    /**
     * Conversão para float, com 6 casas decimais de precisão
     * @param value Valor a ser convertido
     * @returns {Number} Valor convertido
     */
    utils.float = function (value) {
        return parseFloat(parseFloat(value).toFixed(6));
    };

     /**
        * Check if object is null or undefined
        * @param object
        * @returns {boolean}
        */
       utils.isNullOrUndefined = function (object) {
         return typeof(object) === 'undefined' || object === undefined || object === null || object === "";
       }

       /**
          * Convert CPF 123.456.789-09 => 12345678909 (only string 11)
          * @param string
          * @returns {string}
          */
       utils.cpfNoSigns = function (value) {
         var newValue = "";

         if (!/^[0-9]+$/.test(value)) {
           var newValue = "";
           var i;
           for (i=0; i<value.length; i++){
             if (/^[0-9]+$/.test(value[i])){
               newValue = newValue + value[i];
             }
           }
           if (newValue.length !== 11){
              newValue = "";
           }
         } else { //If value = numbers sequence
           if (value.length === 11) {
             newValue = value;
           } else {
             newValue = "";
           }
         }
         return newValue;
       }

       /**
          * Convert CPF 12345678909 => 123.456.789-09
          * @param array
          * @returns {array}
          */
       utils.cpfNoSignsRes = function (array) {
         if (array.length > 0 ) {
           if (!utils.isNullOrUndefined(array[1][2])){
             var i,k;
             if (array[1][2] === "Cpf" || array[1][2] === "CPF" || array[1][2] === "cpf"){
               k = 0;
             } else {
               k = 1;
             }
             for (i=k; i<array.length; i++){
               array[i][2] = utils.cpfNoSigns(array[i][2]);
             }
           }

         }
         return array;
       }
       /**
          * Convert CPF 12345678909 => 123.456.789-09 (only string)
          * @param string
          * @returns {string}
          */
       utils.cpfSigns = function (value) {
         if (value.length === 11) {
           return value.slice(0,3) + '.' + value.slice(3,6) + '.' + value.slice(6,9) + '-' + value.slice(9,11);
         }
         return value;
       }

       /**
          * Convert CPF 12345678909 => 123.456.789-09
          * @param array
          * @returns {array}
          */
       utils.cpfSignsRes = function (array) {
         if (array.length > 0 ) {
           if (!utils.isNullOrUndefined(array[0].cpf)){
             var i;
             for (i=0; i<array.length; i++){
               array[i].cpf = utils.cpfSigns(array[i].cpf);
             }
           }

         }
         return array;
       }

    module.exports = utils;
})();