/**
 * Created by Luciana Costa on 23/10/17.
 */
var fs = require('fs');
var path = require('path');
var Excel = require("exceljs");

//Define as colunas a serem usadas durante a criação do template
var colunas = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
               'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

//Formatações padrão do Template xls
var cellFormat = { //objeto que contém a formatação padrão da célula
                    alignment: { vertical: 'middle', horizontal: 'center' },
                    border: {top: {style:'thin'},left: {style:'thin'},
                             bottom: {style:'thin'},right: {style:'thin'}},
                    font: {name: 'Arial'},
                    setAlignment: function(vert, horiz, rotacao){
                        return {vertical: vert, horizontal: horiz, textRotation: rotacao};
                    },
                    setFont: function(nome, tam, negrito){
                        return {name: nome, size: tam, bold: negrito};
                    },
                    setBorder: function(cima, baixo, esq, dir){
                        return {top: {style: cima},left: {style:left},
                             bottom: {style: baixo},right: {style:right}};
                    }
                };

var whiteLineFormat = { //objeto que contém a formatação padrão de linha divisória em branco
                    border: {top: {style:'thin'},left: {style:'thin'},
                             bottom: {style:'thin'},right: {style:'thin'}},
                    alignment: { vertical: 'middle', horizontal: 'center' } 
                };

//Function to create pattern header of reports
var _createPatternHeader = function (worksheet,header) {
  //Row: Report Title
  worksheet.addRow([" "]);
  cell = worksheet.getCell('A1');
  cell.value = header.name;
  cell.font = cellFormat.setFont('Arial', 12, true);
  cell.border = cellFormat.border;
  cell.alignment = cellFormat.alignment;
  worksheet.mergeCells('A1:' + colunas[header.numColums - 1] + '1');

  //Row: Report Period
  worksheet.addRow([" "]);
  cell = worksheet.getCell('A2');
  cell.value = header.period;
  cell.font = cellFormat.setFont('Arial', 12, true);
  cell.border = cellFormat.border;
  cell.alignment = cellFormat.alignment;
  worksheet.mergeCells('A2:' + colunas[header.numColums - 1] + '2');
  return 2; //actual row
}

//Function to create pattern header of discount employee report
var _createHeaderType4 = function (worksheet,header, rsValue, cnpjValue, row) {
  worksheet.addRow([" "]); row++;

  //Column: Social Reason - Label
  cell = worksheet.getCell('A' + row);
  cell.value = header.personalHeader[0].col;
  cell.font = cellFormat.setFont('Arial', 11, true);
  cell.border = cellFormat.border;
  cell.alignment = cellFormat.alignment;

  //Column: Social Reason - Value
  cell = worksheet.getCell('B' + row);
  cell.value = rsValue;
  cell.font = cellFormat.setFont('Arial', 11, false);
  cell.border = cellFormat.border;
  worksheet.mergeCells('B'+ row + ':D' + row);

  //Column: CNPJ - Label
  cell = worksheet.getCell('E' + row);
  cell.value = header.personalHeader[1].col;
  cell.font = cellFormat.setFont('Arial', 11, true);
  cell.border = cellFormat.border;
  cell.alignment = cellFormat.alignment;

  //Column: CNPJ - Value
  cell = worksheet.getCell('F' + row);
  cell.value = cnpjValue;
  cell.font = cellFormat.setFont('Arial', 11, false);
  cell.border = cellFormat.border;
  cell.alignment = cellFormat.alignment;

  worksheet.addRow([" "]); row++;
  cell = worksheet.getCell('A' + row);
  cell = whiteLineFormat;
  worksheet.mergeCells('A'+ row + ':F' + row);

  return row; //used rows
}

//Gera o nome do relatório por lista de parametros
var _nameFileXls = function(params) {
    var name = '';

    for (i in params){
        name = name + params[i];
    }

    return name + '.xlsx';

}

//Create pattern xls file
function _createXls (type, header, results, nameXls,cb) {
    var nameFile = nameXls;
    var returnName = nameXls;

    // Constroi um workbook xlsx com estilos e strings compartilhados
    var options = {
        filename: nameFile,
        useStyles: true,
        useSharedStrings: true
    };

    var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    // Cria folha por nome
    var worksheet = workbook.addWorksheet(header.sheet);

    var actualRow; //Variável auxiliar para controlar as linhas da tabela

    //*****************************************************************************
    //Pattern Column Width
    var colWidth;
    for (j = 0; j < header.numColums; j++){
      colWidth = worksheet.getColumn(colunas[j]);
      colWidth.width = 20;
    }

    //*****************************************************************************
    //Title Header
      actualRow = _createPatternHeader(worksheet,header);

    //*****************************************************************************
    //Personal Header
      if (type === 4){
        var r = actualRow;
        actualRow = _createHeaderType4(worksheet,header,
                                        results[0][header.personalHeader[0].field],
                                        results[0][header.personalHeader[1].field],
                                        r);
      }

    //*****************************************************************************
    //Colums Header
    worksheet.addRow([" "]); actualRow++;

    for (j = 0; j < header.numColums; j++){
      cell = worksheet.getCell(colunas[j] + '' + actualRow);
      cell.value = header.nameColums[j].col;
      cell.font = cellFormat.setFont('Arial', 10, true);
      cell.border = cellFormat.border;
      cell.alignment = cellFormat.alignment;
      cell.width = 240.0;
    }

    //*****************************************************************************
    //Result Rows
    for (i = 0; i < results.length; i++){
        worksheet.addRow([" "]); actualRow++;

        for (j = 0; j < header.numColums; j++){
            cell = worksheet.getCell(colunas[j] + actualRow );
            cell.value = results[i][header.nameColums[j].field];
            cell.font = cellFormat.font;
            cell.border = cellFormat.border;
            cell.width = 240.0;
        }
    }

    //******************************************************************************
    //Relatório Finalizado

    workbook.commit().then(function () {
                  cb(null, "ok");
              }).catch(function (error) {
                  cb(error, null);
              });
}

module.exports = {
    createXls: _createXls,
    nameFileXls: _nameFileXls
};
