var EventEmitter = require('events').EventEmitter;
var user_service    = require('./user');
var channel_service = require('./channel');
var crawler_service = require('./crawler');
var queue_dao       = require('../dao/queue');

var is_video = function(url){
  var exp = new RegExp("^http:\/\/(www\.)?youtube\.com\/(watch\/|embed\/|watch\/v\/|watch\\?v=)[_a-zA-Z0-9&=\?-]+");
  return url.match(exp) ? true : false;
};
var service = module.exports = {
  get_by_user_id : function(user_id){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      ev.emit('end', channel.queue, channel);
    });
    search_channel.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  post : function(user_id, query){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel) {
      var get_info = crawler_service.get_info(query.url);
      get_info.on('end', function(info){
        var push_queue = queue_dao.push(channel._id, {
          url         : query.url,
          comment     : query.comment,
          type        : is_video(query.url) ? 'video' : 'page',
          title       : info.data.title,
          description : info.data.desc
        });
        push_queue.on('end', function(channel){ ev.emit('end', channel); });
        push_queue.on('error', function(channel){ ev.emit('error', '投稿に失敗しました', 500); });
      });
      get_info.on('error', function(){ ev.emit('error', '投稿に失敗しました', 500); });
    });
    search_channel.on('error', function(message, code) { ev.emit('error', message, code); });
    return ev;
  },
  move : function(user_id, before, after){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var remove_queue = queue_dao.remove(channel._id, before);
      remove_queue.on('end', function(){
        insert_queue = queue_dao.insert(channel._id, after, channel.queue[before]);
        insert_queue.on('end', function(result){ ev.emit('end', result); });
        insert_queue.on('error', function(){ ev.emit('error', '移動に失敗しました', 500); });
      });
      remove_queue.on('error', function(){
        ev.emit('error', '移動に失敗しました', 500);
      });
    });
    search_channel.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  remove : function(user_id, index){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var remove_queue = queue_dao.remove(channel._id, index);
      remove_queue.on('end', function(result){ ev.emit('end', result); });
      remove_queue.on('error', function(){ ev.emit('error', '移動に失敗しました', 500); });
    });
    search_channel.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  get_next : function(user_id, _index){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var index = _index > -1 ? parseInt(_index) : channel.current;
      if(index >= channel.queue.length){
        ev.emit('error', 'コンテンツが見つかりません', 404);
      } else if(index == channel.queue.length - 1) {
        ev.emit('error', '最後の投稿です', 500);
      } else {
        ev.emit('end', channel.queue[index + 1], index + 1);
      }
    });
    search_channel.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  get_prev : function(user_id, _index){
    var ev = new EventEmitter();
    var search_channel = channel_service.find_by_user_id(user_id);
    search_channel.on('end', function(channel){
      var index = _index > -1 ? parseInt(_index) : channel.current;
      if(index >= channel.queue.length){
        ev.emit('error', 'コンテンツが見つかりません', 404);
      } else if(index == 0) {
        ev.emit('error', '最初の投稿です', 500);
      } else {
        ev.emit('end', channel.queue[index - 1], index - 1);
      }
    });
    search_channel.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  go_next : function(user_id){
    var ev = new EventEmitter();
    var get_next = service.get_next(user_id);
    get_next.on('end', function(content, index){
      var update_current = channel_service.update_current(user_id, index);
      update_current.on('end', function(){
        ev.emit('end', content, index); 
      });
      update_current.on('error', function(message, code){
        ev.emit('error', message, code);
      });
    });
    get_next.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  },
  go_prev : function(user_id){
    var ev = new EventEmitter();
    var get_prev = service.get_prev(user_id);
    get_prev.on('end', function(content, index){
      var update_current = channel_service.update_current(user_id, index);
      update_current.on('end', function(){
        ev.emit('end', content, index); 
      });
      update_current.on('error', function(message, code){
        ev.emit('error', message, code);
      });
    });
    get_prev.on('error', function(message, code){
      ev.emit('error', message, code);
    });
    return ev;
  }
};

