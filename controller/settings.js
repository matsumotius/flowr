/**
 * Settings Controller
 */
var path = function(name){ return '../' + name; };
var user_service = require(path('service/user'));
var error_service = require(path('service/error'));
var cookie_service = require(path('service/cookie'));

var settings = module.exports = {
  get : function(req, res){
    var user = cookie_service.get_user(req);
    if(user.exists){
      error_service.render('まだ出来ていません');
    } else {
      error_service.render('ログインしていません');
    }
  }
};
