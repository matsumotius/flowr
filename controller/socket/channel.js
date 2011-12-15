var path = function(name){ return '../../' + name; };
var channel_service = require(path('service/channel'));
var queue_service = require(path('service/queue'));
var channel = module.exports = {
  join : function(io, socket, message){
    if(message){
      if('channel' in message){
        var search_channel = channel_service.find_by_user_id(message.channel.id);
        search_channel.on('end', function(channel){
          var update_access = channel_service.update_access(channel.channel_id);
          update_access.on('end', function(){
            if(channel.access % 3 == 0){
              io.sockets.in('control-'+channel.id).emit('control/update', { key : 'access', value : channel.access });
            }
          });
          update_access.on('error', function(){ /* do nothing */ });
          socket.join(message.channel.id);
          socket.emit('channel/join', { channel : channel });
        });
        search_channel.on('error', function(){
          socket.emit('error');
        });
      }
    }
  },
  // increment fav
  fav  : function(io, socket, message){
    if(message){

    }
  },
  next : function(io, socket, message){
    // validate later
    if(message && 'channel' in message && 'index' in message){
      var get_next = queue_service.get_next(message.channel.id, message.index);
      get_next.on('end', function(content){
        socket.emit('channel/next', { index : message.index + 1, content : content });
      });
      get_next.on('error', function(){ socket.emit('error'); });
    }
  },
  prev : function(io, socket, message){
    if(message && 'channel' in message && 'index' in message){
      var get_prev = queue_service.get_prev(message.channel.id, message.index);
      get_prev.on('end', function(content){
        socket.emit('channel/prev', { index : message.index - 1, content : content });
      });
      get_prev.on('error', function(){
        socket.emit('error');
      });
    }
  }
};
