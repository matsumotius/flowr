var EventEmitter = require('events').EventEmitter;
var crypto_service = require('../service/crypto');
var user_dao = require('../dao/user');
var message = require('../util/message');

var service = module.exports = {
  save : function(query){
    var ev = new EventEmitter();
    var save_user = user_dao.save({
      name : query.user_id,
      user_id : query.user_id,
      password : crypto_service.hash(query.password)
    });
    save_user.on('end', function(user){ ev.emit('end', user); });
    save_user.on('error', function(){ ev.emit('error', message.ERROR.INTERNAL, 500); });
    return ev;
  },
  find_by_user_id : function(user_id){
    var ev = new EventEmitter();
    var search_user = user_dao.find({ user_id : user_id }, [], {});
    search_user.on('end', function(user){
      user.length > 0 ? ev.emit('end', user[0]) : ev.emit('error', message.ERROR.NOTFOUND, 404);
    });
    search_user.on('error', function(){
      ev.emit('error', message.ERROR.INTERNAL, 500);
    });
    return ev;
  }
};
