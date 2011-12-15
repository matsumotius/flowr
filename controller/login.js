/**
 *  Login
 **/
var message = require('../util/message');
var user_service = require('../service/user');
var error_service = require('../service/error');
var crypto_service = require('../service/crypto');
var cookie_service = require('../service/cookie');
var store = new (require('connect').session.MemoryStore)();
var application = module.exports = {
  get : function(req, res){
    res.render(req.session.type + '/login.jade', { locals : {} });
  },
  post : function(req, res){
    var search_user = user_service.find_by_user_id(req.body.user_id);
    search_user.on('end', function(user){
      if(user.password == crypto_service.hash(req.body.password)){
        req.session.user = {
          _id : user._id,
          user_id : user.user_id,
          name : user.name
        };
        res.redirect('/');
      } else {
        error_service.render(res, message.ERROR.LOGIN);
      }
    });
    search_user.on('error', function(){ res.send('error'); });
  }
};

