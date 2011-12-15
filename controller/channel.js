/**
 * Channel Controller
 */
var path = function(name){ return '../' + name; };
var user_service = require(path('service/user'));
var error_service = require(path('service/error'));
var channel_service = require(path('service/channel'));
var cookie_service = require(path('service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var channel = module.exports = {
  get : function(req, res){
    var searching_user = user_service.find_by_user_id(req.params.user_id);
    searching_user.on('end', function(user){
      var searching_channel = channel_service.find_by_user_id(user.user_id);
      searching_channel.on('end', function(channel){
        res.render(req.session.type + '/channel.jade', { locals : { channel : channel } });
      });
      searching_channel.on('error', function(){ res.send('error'); });
    });
    searching_user.on('error', function(message, code){ res.send('error'); });
  }
};
