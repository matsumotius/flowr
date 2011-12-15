var path = function(name){ return '../../' + name; };
var channel_service = require(path('service/channel'));
var queue_service = require(path('service/queue'));

var control = module.exports = {
  join : function(io, socket, message){
    if(message){
      if('channel' in message){
        var channel = message.channel;
        var search_channel = channel_service.find_by_user_id(channel.id);
        search_channel.on('end', function(channel){
          socket.join('control-' + channel.id);
          socket.emit('control/join', { channel : channel });
        });
        search_channel.on('error', function(){ socket.emit('error'); });
      }
    }
  },
  next : function(io, socket, message){
    if(message && 'channel' in message && 'index' in message){
      var go_next = queue_service.go_next(message.channel.id);
      go_next.on('end', function(content, index){
        var result = { index : index, content : content };
        io.sockets.in(message.channel.id).emit('channel/next', result);
        socket.emit('control/next', result);
      });
      go_next.on('error', function(message, code){ socket.emit('error'); });
    }
  },
  prev : function(io, socket, message){
    if(message && 'channel' in message && 'index' in message){
      var go_prev = queue_service.go_prev(message.channel.id, message.index);
      go_prev.on('end', function(content, index){
        var result = { index : index, content : content };
        io.sockets.in(message.channel.id).emit('channel/prev', result);
        socket.emit('control/prev', result);
      });
      go_prev.on('error', function(message, code){ socket.emit('error'); });
    }
  },
  move : function(io, socket, message){
    if(message && 'channel' in message && 'before' in message && 'after' in message){
      var move_queue = queue_service.move(message.channel.id, message.before, message.after);
      move_queue.on('end', function(channel){
        socket.emit('control/move', { channel : channel });
      });
      move_queue.on('error', function(message, code){ scoket.emit('error'); });
    }
  },
  remove : function(io, socket, message){
    if(message && 'channel' in message && 'index' in message){
      console.log(message);
      var remove_queue = queue_service.remove(message.channel.id, message.index);
      remove_queue.on('end', function(channel){
        socket.emit('control/remove', { index : message.index, channel : channel });
      });
      remove_queue.on('error', function(message, code){ scoket.emit('error'); });
    }
  }
};
