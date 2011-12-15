var EventEmitter = require('events').EventEmitter;
var content_service = require('./content');
var user_service    = require('./user');
var channel_dao     = require('../dao/channel');

var service = module.exports = {
  save : function(query) {
    var ev = new EventEmitter();
    var archiving_channel = channel_dao.save(query);
    archiving_channel.on('end', function(channel){ ev.emit('end', channel); });
    archiving_channel.on('error', function(){ ev.emit('error'); });
    return ev;
  },
  save_by_user_id : function(user_id) {
    var ev = new EventEmitter();
    var searching_user = user_service.find_by_user_id(user_id);
    searching_user.on('end', function(user) {
      var archiving_channel = channel_dao.save({
        channel_id : user_id,
        name : user_id + 'さんのチャンネル',
        owner : user._id
      });
      archiving_channel.on('end', function(channel){ ev.emit('end', channel); });
      archiving_channel.on('error', function(){ ev.emit('error', '', 500); });
    });
    searching_user.on('error', function(message, code){ ev.emit('error', message, code); });
    return ev;
  },
  find_by_user_id : function(user_id){
    var ev = new EventEmitter();
    var searching_channel = channel_dao.find({ channel_id : user_id }, [], {});
    searching_channel.on('end', function(channel) {
      if(channel.length > 0) { ev.emit('end', channel[0]); } 
      else { ev.emit('error', '存在しないチャンネルです', 404); }
    });
    searching_channel.on('error', function(){ ev.emit('error'); });
    return ev;
  },
  find_by_fav : function(fav_array){
    var ev = new EventEmitter();
    var search_channel = channel_dao.find(
      { channel_id : { $in : fav_array } },
      ['_id', 'channel_id', 'description'],
      { sort : { 'updated_at' : -1 } }
    );
    search_channel.on('end', function(channels) {
      if(channels.length > 0) { ev.emit('end', channels); } 
      else { ev.emit('error', 'チャンネルがありません', 404); }
    });
    search_channel.on('error', function(){ ev.emit('error'); });
    return ev;
  },
  find_all : function(limit){
    var ev = new EventEmitter();
    var searching_channel = channel_dao.find({}, ['_id', 'channel_id', 'description'], {});
    searching_channel.on('end', function(channels){
      if(channels.length > 0) { ev.emit('end', channels); } 
      else { ev.emit('error', 'チャンネルがありません', 404); }
    });
    searching_channel.on('error', function(){ ev.emit('error', 'internal error', 500); });
    return ev;
  },
  get_current : function(channel_key) {
    var ev = new EventEmitter();
    var searching_channel = channel_dao.find({ _id : channel_key }, [], {});
    searching_channel.on('end', function(channels) {
      var channel = channels[0];
      if(channel.current >= channel.queue.length || channel.current < 0){
        ev.emit('error', 'コンテンツが見つかりませんでした', 404);
      } else {
        ev.emit('end', channel.queue[channel.current]);
      }
    });
    searching_channel.on('error', function(){ ev.emit('error'); });
    return ev;
  },
  update_current : function(user_id, index){
    var ev = new EventEmitter();
    var searching_channel = service.find_by_user_id(user_id);
    searching_channel.on('end', function(channel){
      var updating_now = channel_dao.update(channel.id, { current : index });
      updating_now.on('end', function(){ ev.emit('end'); });
      updating_now.on('error', function(){ ev.emit('error', 'エラーが発生しました', 500); });
    });
    searching_channel.on('error', function(message, code){ ev.emit('error', message, code); });
    return ev;
  },
  update_access : function(user_id){
    var ev = new EventEmitter();
    var search_channel = service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var update_access = channel_dao.update(channel.id, { access : channel.access + 1 });
      update_access.on('end', function(){ ev.emit('end'); });
      update_access.on('error', function(){ ev.emit('error', 'エラーが発生しました', 500); });
    });
    search_channel.on('error', function(message, code){ ev.emit('error', message, code); });
    return ev;
  },
  update_fav : function(user_id){
    var ev = new EventEmitter();
    var search_channel = service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var update_fav = channel_dao.update(channel.id, { fav : channel.fav + 1 });
      update_fav.on('end', function(){ ev.emit('end'); });
      update_fav.on('error', function(){ ev.emit('error', 'エラーが発生しました', 500); });
    });
    search_channel.on('error', function(message, code){ ev.emit('error', message, code); });
    return ev;
  },
  get_current_by_user_id : function(user_id){
    var ev = new EventEmitter();
    var searching_channel = channel_dao.find({ channel_id : user_id }, [], {});
    searching_channel.on('end', function(channels){
      var channel = channels[0];
      if(channel.current >= channel.queue.length || channel.current < 0){
        ev.emit('error', 'コンテンツが見つかりませんでした', 404);
      } else {
        ev.emit('end', channel.queue[channel.current]);
      }
    });
    searching_channel.on('error', function(){ ev.emit('error'); });
    return ev;
  }
};

