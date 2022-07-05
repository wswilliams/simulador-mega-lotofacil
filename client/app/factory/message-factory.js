/**
 * Created Bruno 21/06/2016.
 * factory returno alert
 * param type message
 */

(function (angular) {
    angular.module('app').factory('Message', function () {
        var typeToastr = {"error": toastr.error, "info": toastr.info, "success": toastr.success};
        return {
            SAVETRUE: function () {
                toastr.clear();
                toastr.success('Salvo com sucesso');
            },
            SAVETRUEPARAM: function (param) {
                toastr.clear();
                toastr.success(param);
            },
            SAVEERRO: function () {
                toastr.clear();
                toastr.error('Erro ao salvar item');
            },
            EDITETRUE: function () {
                toastr.clear();
                toastr.success('Alterado com sucesso');
            },
            EDITEERRO: function () {
                toastr.clear();
                toastr.error('Erro ao alterar dados');
            },
            DELETETRUE: function () {
                toastr.clear();
                toastr.success('Excluído com sucesso');
            },
            DELETEERRO: function () {
                toastr.clear();
                toastr.error('Erro ao deletar item');
            },
            CUSTOM: function (msg, typeMsg) {
                toastr.clear();
                typeToastr[typeMsg](msg);
            },
            REMOVE: function () {
                return "Deseja remover este registro?";
            },
            SELECTANOPTION: function () {
                toastr.clear();
                toastr.error('É obrigatório selecionar uma empresa.');
            },
            INVALID: function (params) {
                toastr.clear();
                toastr.error(params);
            }
        }
    });
})(angular);
