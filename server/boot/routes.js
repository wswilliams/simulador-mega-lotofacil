var bodyParser = require('body-parser'),
        jsonParser = bodyParser.json();

module.exports = function (app) {

    var controller = require('./controllers')(app);

    /**
     * Index
     */
    var routesAngular = [
        '/', '/login',
        '/home',
        '/facil',
        '/mega',
        '/number-facil',
        '/number-mega'
    ]


    app.get(routesAngular, function (req, res, next) {
        res.render('index.html');
    });

    /**
     * Register Merchant
     */
    app.post('/register', jsonParser, controller.register);


    app.get('/logout/:userId', function (req, res, next) {
        if (!req.accessToken)
            return res.sendStatus(401); //return 401:unauthorized if accessToken is not present

        app.models.User.deleteById(req.params.userId, function (err,result) {
            if (err){

                res.send("FALSE");
            }else{

                res.send("TRUE");
            }
        });
    });
};
