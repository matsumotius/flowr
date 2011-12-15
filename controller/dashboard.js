/**
 *  Dashboard
 **/
var path = function(name) { return '..' + name; };
var error_service = require(path('/service/error'));
var user_service    = require(path('/service/user'));
var channel_service = require(path('/service/channel'));
var queue_service   = require(path('/service/queue'));
var cookie_service  = require(path('/service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var application = module.exports = {
  get : function(req, res){
    if(cookie_service.has_user(req.session)){
      var search_channel = channel_service.find_by_user_id(req.session.user.user_id);
      search_channel.on('end', function(channel){
        if(req.session.type == 'mobile'){
          var search_user = user_service.find_by_user_id(req.session.user.user_id);
          search_user.on('end', function(user){
            var fav_array = [];
            for(var i=0;i<user.fav.length;i++){
              fav_array.push(user.fav[i].channel_id);
            }
            var search_fav = channel_service.find_by_fav(fav_array);
            search_fav.on('end', function(channels){
              res.render(req.session.type + '/dashboard.jade', {
                locals : {
                  user    : req.session.user,
                  channel : channel,
                  fav     : channels
                }
              });
            });
            search_fav.on('error', function(message, code){
              error_service.render(res, message);
            });
          });
          search_user.on('error', function(message, code){ error_service.render(res, message); });
        } else {
          res.render(req.session.type + '/dashboard.jade', {
            locals : {
              user : req.session.user,
              channel : channel
            }
          });
        }
      });
      search_channel.on('error', function(message, code){
        error_service.render(res, message);
      });
    } else {
      res.redirect('/application');
    }
  },
  post : function(req, res){
    if(cookie_service.has_user(req.session)){
      var post_queue = queue_service.post(req.session.user.user_id, req.body);
      post_queue.on('end', function(channel){
        res.render(req.session.type + '/dashboard.jade', {
          locals : {
            user    : req.session.user,
            channel : channel
          }
        });
      });
      post_queue.on('error', function(){
        error_service.render(res, message);
      });
    } else {
      res.redirect('/application');
    }
  }
};
