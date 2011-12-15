/**
 * Zapping Controller
 **/
var path = function(name) { return '..' + name; };
var user_service = require(path('/service/user'));
var channel_service = require(path('/service/channel'));
var cookie_service = require(path('/service/cookie'));
var store = new (require('connect').session.MemoryStore)();

var zapping = module.exports = {
  get : function(req, res){
    if(cookie_service.has_user(req.session)){
      res.render(req.session.type + '/zapping.jade', {
        locals : {
          user : req.session.user
        }
      });
    } else {
      res.redirect('/application');
    }
  }
};
