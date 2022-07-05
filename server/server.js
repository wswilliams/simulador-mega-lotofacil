var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var app = module.exports = loopback();


app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.resolve(__dirname, '../client'));
app.set('img-produto', path.resolve(__dirname, 'storage/img-produto/'));

// static directory
//app.use(loopback.static(path.resolve(__dirname, '../client')));
app.use(loopback.static(path.resolve(__dirname, './storage')));
// Set up the /favicon.ico

app.use(loopback.favicon( path.resolve(__dirname, '../favicon.ico')));

app.use(loopback.token()); // this calls getCurrentContext
//app.use(loopback.context()); // the context is started here
 
app.start = function () {

    // start the web server
    return app.listen(function () {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err)
        throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});