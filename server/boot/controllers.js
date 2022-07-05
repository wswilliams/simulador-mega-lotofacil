/**
 * Created by Bruno.
 */

var bodyParser = require('body-parser'),
        jsonParser = bodyParser.json(),
        formating = require('../lvr/utils/format.js'),
        fs = require('fs'),
        path = require('path');

module.exports = function (app) {

    var loopback = app.loopback,
            bcrypt = require('bcrypt-nodejs');

    app.use(loopback.token());
    
    var controller = {};
    controller.index = function (req, res, next) {
        
        res.render('index.html');
    };

    controller.login = function (req, res, next) {
        res.render('');
    };

    controller.register = function (req, res) {
        
        var body = req.body;
        var ds = app.models.Salesperson.dataSource;
        
        // Model User
        var User = app.models.User;
        var Group = app.models.GroupPermissionsUsers;
        
        if(!isNullOrUndefined(body.email) && !isNullOrUndefined(body.password)){
            
            loginWeb(ds,body,res);
            
        }else{
            
            res.send({loginFailed: true});
        }
        // Data Resquest
       function loginWeb(ds,body,res){

               var sqlQuery="";
               sqlQuery = fs.readFileSync(path.resolve(__dirname, '../lvr/salesperson/sql/select-login.sql')).toString();

                var sql = "u.login = '"+body.email+"' AND g.group_permissions_id <> 2 AND u.enable = 1 AND s.enabled = 1";

                sqlQuery = formating.format(sqlQuery, sql);
                    
                     ds.connector.query(sqlQuery, function (err, data) {

                     if (err) {
                         res.send({error: true, message: err, authorized: false});
                     } else if (data.length > 0) { // contem registro

                         bcrypt.compare(body.password, data[0].password, function (err, _return) {
                             if (_return === true) {
                                 // Check user in memory
                                 
                                 User.findOne({where: {email: body.email}}, function (err, user) {
                                     if (user !== null) {
                                         User.login({
                                             email: body.email,
                                             password: body.password
                                         }, 'user', function (err, token) {
                                             console.log("err ",err)
                                             if (err)
                                                 res.send({loginFailed: true});
                                             else
                                                 res.send({error: false, authorized: true, token: token, password: body.password});
                                         });
                                     } else {

                                         User.create({
                                             email: body.email,
                                             password: body.password,
                                             credentials: data[0]
                                         }, function (err, userResult) {
                                             
                                             var group={
                                                    "firtLogin": 1,
                                                  };
                                                  
                                             Group.updateAll({"groupPermissionsUsersId":data[0].group_permissions_users_id},group,function(err,res){
                                                 if (err)
                                                    console.log(err)
                                             })
                                                     
                                             if (err)
                                                 res.send(err);

                                             User.login({
                                                 email: body.email,
                                                 password: body.password
                                             }, 'user', function (err, token) {

                                                 if (err)
                                                     res.send({loginFailed: true});
                                                 else
                                                     res.send({error: false, authorized: true, token: token, password: body.password});
                                             });
                                         });
                                     }
                                 });

                             } else {
                                 res.send({error: true, authorized: false});
                             }
                         });

                     } else {
                         res.send({error: true, authorized: false});
                     }

                 });

       }
       

        
        /**
        * Check if object is null or undefined
        * @param object
        * @returns {boolean}
        */
       function isNullOrUndefined(object) {
         return typeof(object) === 'undefined' || object === undefined || object === null;
       }
    };
    

    return controller;

}