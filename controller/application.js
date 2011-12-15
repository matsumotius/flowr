/**
 *  Application
 **/
var path = function(name) { return '..' + name; };
var error_service = require(path('/service/error'));
var user_service = require(path('/service/user'));
var channel_service = require(path('/service/channel'));
var cookie_service = require(path('/service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var application = module.exports = {
  get : function(req, res){
    res.render(req.session.type + '/application.jade', {
      locals : {}
    });
  },
  post : function(req, res){
    var save_user = user_service.save(req.body);
    save_user.on('end', function(user){
      req.session.user = { id : user.user_id, name : user.name };
      var save_channel = channel_service.save({
        channel_id : user.user_id,
        name : user.name + 'さんのチャンネル',
        owner : user._id
      });
      save_channel.on('end', function(){
        console.log(user);
        res.render(req.session.type + '/welcome.jade', { locals : { user : user } });
      });
      save_channel.on('error', function(message, code){
        error_service.render(res, message);
      });
    });
    save_user.on('error', function(message, code){ error_service.render(res, message); });
  }
};

