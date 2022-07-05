(function () {

    angular.module('app').controller('lotoFacilAddController', lotoFacilAddController);

    function lotoFacilAddController($scope, Message, FileUploader, NumerosSortiados, $http, $location, $state) {
        $scope.list=[];
        $scope.list_testSet=[];
        $scope.xlm = false;
        $scope.saveButton = false;
       
        $(document).on('change', ':file', function () {
            var input = $(this),
                    numFiles = input.get(0).files ? input.get(0).files.length : 1,
                    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

            var input = $(this).parents('.input-group').find(':text'),
                    name = numFiles > 1 ? numFiles + ' files selected' : label;

            input.val(name);
            
        });


        //Conf upload
        var uploader = $scope.uploader = new FileUploader({
            url: '/api/containers/lotofacil/upload'
        });

        // ADDING FILTERS
        uploader.filters.push({
            name: 'filterName',
            fn: function (item, options) {
                if (item.size > 1000000) {
                    Message.CUSTOM('Tamanho máximo : 1 MB', 'error');
                    return false;
                } else{
                    $scope.saveButton = true;
                    return true;
                }

                // second user filter
                uploader.clearQueue();
            }
        });

        // ERRO FILE
        uploader.onErrorItem = function (item, response, status, headers) {
            Message.CUSTOM('Erro no arquivo', 'error');
        };
        $scope.showCountNumber = function(){
            NumerosSortiados.findCoutNumber()
                .$promise
                .then(function (results) {
                    
                    $state.go("number-facil");
            });
        }
        
       
        $scope.submit = function (form) {
            $scope.saveButton = false;

            //Upload file
            uploader.uploadAll();
            uploader.onSuccessItem = function (item, response, status, headers) {
                var retrievedObject = localStorage.currentUser;
                var currentUser = JSON.parse(retrievedObject);

                var nameFile = {
                    file: response.result.files.file[0],
                    loginId: currentUser.credentials.loginId,
                    typeNumerosSortiadosId:1
                }
                NumerosSortiados.saveFile(nameFile, function (_return) {
                    $scope.saveButton = true;
                    $scope.xlm=true;
                    if (_return.response.message !== "Arquivo incorreto") {
                        if (_return.response.list > 0) {
                            
                            Message.SAVETRUEPARAM("Numeros gerado com sucesso");
                            
                            $http.delete('/api/containers/lotofacil/files/' + encodeURIComponent(nameFile.file.name));
                            $scope.showCountNumber();
                            
                        } else {
                            Message.INVALID("Erro ao salvar o arquivo");
                            $http.delete('/api/containers/lotofacil/files/' + encodeURIComponent(nameFile.file.name));
                        }
                    } else {
                        Message.INVALID(_return.response.message);
                        $http.delete('/api/containers/lotofacil/files/' + encodeURIComponent(nameFile.file.name));
                    }
                });
            };
        };
        
    }

})();
