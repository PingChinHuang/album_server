const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

var base_album_dir = '/media/superod/DATA/Photos'

var traverseDir = (dir, dir_only, done) => {
  var results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);

    var pending = list.length;
    list.forEach(file => {
      var abs_file = path.resolve(dir, file);
      fs.stat(abs_file, (err, stat) => {
        if (err) throw err;
        if (stat.isDirectory()) {
          results.push(file);
          traverseDir(abs_file, dir_only, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (!dir_only) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

app.get('/', (req, resp) => {
  var album_list = [];

  traverseDir(base_album_dir, 1, (err, res) => {
    if (err) throw err;
    album_list = album_list.concat(res);
    console.log(album_list);
    resp.render('index', {title: 'Albums', album: album_list});
  });
});

app.get('album/*', (req, res) => {

});

var server = http.createServer(app);
server.listen(8081, () => {
  console.log('Server running!');
  console.log('http://%s:%s', server.address().address, server.address().port);
});
