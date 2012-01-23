/**
 *  UserFront
 */
var express = require('express');
var app = module.exports = express.createServer();
var error_service = require('./service/error');
var request_service = require('./service/request');
var RedisStore = require('connect-redis');
var csrf = require('express-csrf');
var config = require('./resource/config');
var store = new (require('connect').session.MemoryStore)();

app.configure(function(){
  app.set('views', __dirname + '/view');
  app.set('view options', { layout : false, filename : __dirname + '/view/index.jade' });
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/static'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ store : store, secret: '20111114', cookie: { httpOnly: false } }));
  app.dynamicHelpers({
    csrf : csrf.token,
    user : function(req, res){ return request_service.get_user(req); },
    type : function(req, res){ return request_service.get_type(req); },
    host : function(req, res){ return config.host; },
    api  : function(req, res){ return config.api; }
  });
  app.use(csrf.check());
});

var url_mapping = {
  load : function(name){
    return require('./controller' + name); 
  },
  ua   : function(req, res, next){
    req.session.type = request_service.get_type(req);
    next(); 
  },
  get  : function(uri, load_path){
    app.get(uri, url_mapping.ua, url_mapping.load(load_path).get);
  },
  post : function(uri, load_path){
    app.post(uri, url_mapping.ua, url_mapping.load(load_path).post);
  }
};

/* GET */
url_mapping.get('/', '/dashboard');
url_mapping.get('/application', '/application');
url_mapping.get('/login', '/login');
url_mapping.get('/settings', '/settings');
url_mapping.get('/control', '/control');
url_mapping.get('/zapping', '/zapping');
url_mapping.get('/ch/:user_id', '/channel');
/* POST */
url_mapping.post('/', '/dashboard');
url_mapping.post('/login', '/login');
url_mapping.post('/application', '/application');
url_mapping.post('/settings', '/settings');
  
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket){
  // todo: fix
  var path = function(name){ return require('./controller' + name); };
  var socket_path = function(callback, socket, message){ callback(io, socket, message); };
  socket.on('channel/join', function(message){
    socket_path(path('/socket/channel').join, socket, message);
  });
  socket.on('channel/prev', function(message){
    socket_path(path('/socket/channel').prev, socket, message);
  });
  socket.on('channel/next', function(message){
    socket_path(path('/socket/channel').next, socket, message);
  });
  socket.on('control/join', function(message){
    socket_path(path('/socket/control').join, socket, message);
  });
  socket.on('control/prev', function(message){
    socket_path(path('/socket/control').prev, socket, message);
  });
  socket.on('control/next', function(message){
    socket_path(path('/socket/control').next, socket, message);
  });
  socket.on('control/move', function(message){
    socket_path(path('/socket/control').move, socket, message);
  });
  socket.on('control/remove', function(message){
    socket_path(path('/socket/control').remove, socket, message);
  });
  socket.on('zapping/join', function(message){
    socket_path(path('/socket/zapping').join, socket, message);
  });
  socket.on('zapping/move', function(message){
    socket_path(path('/socket/zapping').move, socket, message);
  });
  socket.on('zapping/change', function(message){
    socket_path(path('/socket/zapping').change, socket, message);
  });
});

