/**
 * Channel Controller
 */
var path = function(name){ return '../../' + name; };
var user_service = require(path('service/user'));
var error_service = require(path('service/error'));
var channel_service = require(path('service/channel'));
var cookie_service = require(path('service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var channel = module.exports = {
  get : function(req, res){
    var search_channel = channel_service.find_by_user_id(req.params.user_id);
    search_channel.on('end', function(channel){
      res.contentType('application/json');
      res.send(JSON.stringify({ is_success : true, data : channel }));
    });
    search_channel.on('error', function(message, code){
      res.contentType('application/json');
      res.send(JSON.stringify({ is_success : false, message : message }));
    });
  }
};
