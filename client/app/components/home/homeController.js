(function () {

    angular.module('app').controller('homeController', homeController);

    function homeController($scope, Message, FileUploader, NumerosSortiados, $http, $location, $state) {
        $scope.list=[];
        $scope.list_testSet=[];
        $scope.xlm = false;
       

        $scope.showTestset = function(){
            NumerosSortiados.find({"filter":{"order":"numero ASC"}}).$promise.then(function (results) {
                $scope.list_testSet=results;
            });
            var query = {
                "date_begin": $scope.form.data.date_begin,
                "date_end": $scope.form.data.date_end,
                "clusterId": $scope.form.clusterId,
                "status": $scope.form.status,
            };
            
            Transation.generateOrderReportDateNow(query)
                    .$promise
                    .then(function (data) {
                        if (data.report.response === 200) {
                            //sucesso
                            $scope.download_report = true;
                            console.log(data);
                            document.getElementById('download').setAttribute("href", data.report.url);
                            document.getElementById('download').click();
                            $scope.download_report = false;
                        } else if (data.report.response === 404) {
                            Message.CUSTOM('Não há dados para serem gerados dessa consulta', 'error');
                        } else {
                            Message.CUSTOM('Erro ao gerar o relatório', 'error');
                        }
                    });
        }

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
                } else
                    return true;

                // second user filter
                uploader.clearQueue();
            }
        });

        // ERRO FILE
        uploader.onErrorItem = function (item, response, status, headers) {
            Message.CUSTOM('Erro no arquivo', 'error');
        };

        $scope.saveButton = true;
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
                            $scope.showTestset();
                            Message.SAVETRUEPARAM("Numeros gerado com sucesso");
                            
                            $http.delete('/api/containers/lotofacil/files/' + encodeURIComponent(nameFile.file.name));
                            
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
