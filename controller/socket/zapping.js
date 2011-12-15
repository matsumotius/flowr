var path = function(name){ return '../../' + name; };
var user_service = require(path('service/user'));
var channel_service = require(path('service/channel'));

var reverse = function(type){ return type == 'zapping' ? 'display' : 'zapping'; };
var control = module.exports = {
  join : function(io, socket, message){
    if(message){
      if('user' in message && 'type' in message){
        var search_user = user_service.find_by_user_id(message.user.user_id);
        search_user.on('end', function(user){
          var name = message.type + '-' + user.user_id;
          socket.join(name);
          socket.set('name', name, function(){
            io.sockets.in(reverse(message.type)+'-'+user.user_id).emit('zapping/join')
          });
          if(message.type == 'display'){
            var get_channel = channel_service.find_all();
            get_channel.on('end', function(channels){
              socket.emit('zapping/display/join', { channel_array : channels, fav_array : user.fav });
            });
            get_channel.on('error', function(){ socket.emit('error'); });
          }
        });
        search_user.on('error', function(){ socket.emit('error'); });
      }
    }
  },
  move : function(io, socket, message){
    if(message){
      socket.get('name', function(error, name){
        if(!error && name){
          var type = name.split('-')[0];
          var id   = name.split('-')[1];
          console.log(name, type, id);
          io.sockets.in(reverse(type)+'-'+id).emit('zapping/move', message);
        }
      });
    }
  },
  change : function(io, socket, message){
    if(message){
      socket.get('name', function(error, name){
        if(!error && name){
          var type = name.split('-')[0];
          var id   = name.split('-')[1];
          io.sockets.in(reverse(type)+'-'+id).emit('zapping/change', message);
        }
      });
    }
  }
};
