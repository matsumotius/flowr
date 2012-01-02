var EventEmitter = require('events').EventEmitter;
var Channel = require('../model/channel');

var dao = module.exports = {
  save : function(query) {
    var ev = new EventEmitter();
    var channel = new Channel(query);
    channel.save(function(error){
      if(!error) {
        ev.emit('end', channel);
      } else {
        console.log('channel_dao_save:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  find : function(query, field, option){
    var ev = new EventEmitter();
    Channel.find(query, field, option, function(error, channels){
      if(!error && channels) {
        ev.emit('end', channels);
      } else {
        console.log('channel_dao_find:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  update : function(id, query){
    var ev = new EventEmitter();
    Channel.update({ '_id' : id }, query, function(error){
      if(!error) {
        ev.emit('end');
      } else {
        console.log('channel_dao_update:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  remove : function(id){
    var ev = new EventEmitter();
    Channel.remove({ '_id' : id }, function(error) {
      if(!error) {
        ev.emit('end');
      } else {
        console.log('channel_dao_remove:', error);
        ev.emit('error');
      }
    });
    return ev;
  }
};
