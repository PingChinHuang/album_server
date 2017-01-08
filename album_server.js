const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

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

app.get('/album/*', (req, res) => {
  var list = [];
  var jpg_list = [];
  var album_path = path.resolve(base_album_dir, decodeURI(path.basename(req.url)));
  list = list.concat(fs.readdirSync(album_path));
  for (var i = 0; i < list.length; i++) {
    if (path.extname(list[i]).toLowerCase() == '.jpg') {
      jpg_list.push(list[i]);
    }
  }
  console.log(jpg_list);
  console.log(decodeURI(path.basename(req.url)));

  res.render('album', {title: decodeURI(path.basename(req.url)),
                        photos: jpg_list});
});

app.get('/photos/*', (req, res) => {
  console.log(decodeURI(req.url));
  var photo_path = path.resolve(base_album_dir,
                                decodeURI(req.url.replace('/photos/', '')));
  console.log(photo_path);
});

var server = http.createServer(app);
server.listen(8081, () => {
  console.log('Server running!');
  console.log('http://%s:%s', server.address().address, server.address().port);
});
