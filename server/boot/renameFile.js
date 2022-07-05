 module.exports = function(app) {
    var path = require('path');

    var ds = app.loopback.createDataSource('storage',
    {        
        connector: require('loopback-component-storage'),
        provider: 'filesystem',
        maxFileSize: "52428800",
        root: path.join(__dirname , '../../server/storage'),
        getFilename: function(fileInfo, req, res) {
          var origFilename = fileInfo.name;

          // optimisticly get the extension
          var parts = origFilename.split('.'),
              extension = parts[parts.length-1];

          // Using a local timestamp + user id in the filename (you might want to change this)
          //var newFilename = md5(origFilename)+'.'+extension;
           var newFilename = (new Date()).getTime()+'.'+extension;
          return newFilename;
        }
    });

    var model = ds.createModel('container', {}, {base: 'Model'});
    
    app.model(model,{dataSource: ds, public: true});

};