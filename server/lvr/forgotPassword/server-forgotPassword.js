(function () {
    'use strict';

    var
            loopback = require('loopback'),
            Email = loopback.Email,
            moment = require('moment')


    var main = {}


    main.sendPasswordToEmail = function (email, password, cb) {
        return new Promise(function (resolve, reject) {


            const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
              </head>
              <body>
                <h2 style="color: #5b8497; font-weight:bold">Recuperar Senha</h2>
                <p style="color: #707070">
                  Prezado(a),<br><br>
                  Este é um aviso automático sobre o pedido de recuperação de senha da sua conta realizado em<br>
                  ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}
                  <br><br>
                  Sua nova senha é: <b>${password}</b>.
                </p>
              </body>
            </html>
        `;

            Email.send({
                to: email,
                from: 'helpdesk@transire.com.br',
                subject: 'Recuperação de Senha',
                html: html
            }, (err, mail) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            });

        })
    }

    module.exports = main;

})();
