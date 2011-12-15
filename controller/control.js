/**
 *  Control
 **/
var path = function(name) { return '..' + name; };
var error_service = require(path('/service/error'));
var user_service = require(path('/service/user'));
var channel_service = require(path('/service/channel'));
var cookie_service = require(path('/service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var application = module.exports = {
  get : function(req, res) {
    if(cookie_service.has_user(req.session)){
      var search_channel = channel_service.find_by_user_id(req.session.user.user_id);
      search_channel.on('end', function(channel){
        var name = req.session.type == 'mobile' ? 'control' : 'dashboard';
        res.render(req.session.type + '/' + name + '.jade', {
          locals : {
            user : req.session.user,
            channel : channel
          }
        });
      });
      search_channel.on('error', function(message, code){
        error_service.render(res, message);
      });
    } else {
      res.redirect('/application');
    }
  }
};
