$(function(){
  $('#feedback').popover({
    animate   : false,
    html      : true,
    placement : 'below',
    trigger   : 'manual',
    offset    : 40
  });
  FLOWR.Channel = {};
  FLOWR.Channel.video = null;
  FLOWR.Channel.set_video = function(content){
    var option = { width  : $('body').width(), height : $('body').height() };
    FLOWR.Channel.video = $('#player').ganpuku(content.url, option);
    FLOWR.Channel.video.on_load(function(){
      FLOWR.Channel.video.on('ready', function(){
        FLOWR.Channel.video.player.play();
        FLOWR.Zapping.sync_video();
      });
      FLOWR.Channel.video.on('end', function(){
        socket.emit('channel/next', { 
          index   : FLOWR.Channel.current.index,
          channel : FLOWR.attribute.channel 
        });
      });
    });
  }
  FLOWR.View.Parts.frame = $('#content-frame');
  FLOWR.View.Parts.queue = FLOWR.View.Parts.frame.fusuma();
  FLOWR.Channel.current  = {};
  FLOWR.Channel.move = function(dir, content){
    if(content.type == 'video' && FLOWR.Channel.video){
      FLOWR.Channel.video.change(content.url);
      return;
    }
    FLOWR.Channel.video = null;
    var reverse = function(d){ return d == 'next' ? 'prev' : 'next' };
    var frame = FLOWR.View.Generator.frame[content.type](content.url);
    FLOWR.View.Parts.queue.add(frame).to(dir);
    FLOWR.View.Parts.queue.go(dir, function(){
      FLOWR.View.Parts.queue.remove(reverse(dir));
      FLOWR.Zapping.change_mode(content.type)
      if(content.type == 'video') FLOWR.Channel.set_video(content);
      FLOWR.Channel.comment(content.comment);
    });
    $('#header .channel-title').find('a').text(content.title);
    $('#header .channel-title').find('a').attr('href', content.url);
    FLOWR.Channel.notify('移動しました');
  };
  FLOWR.Channel.message = FLOWR.View.Parts.panel.message;
  FLOWR.Channel.control = FLOWR.View.Parts.panel.control
  $('#header .container').append(FLOWR.Channel.message);
  $('#header .container').append(FLOWR.Channel.control);
  FLOWR.Channel.notify = function(message){
    FLOWR.Channel.message.find('a').text(message);
  };
  FLOWR.Channel.comment = function(message){
    var comment = message && message.length > 0 ? message : FLOWR.attribute.channel.id + 'さんのチャンネル';
    FLOWR.Channel.notify(comment);
  }
  // socket
  var user = FLOWR.attribute.user;
  var socket = io.connect(FLOWR.attribute.host);
  socket.emit('channel/join', { 
    user    : user.exists == false ? user : null,
    channel : FLOWR.attribute.channel
  });
  socket.on('message', function(message){
    console.log('message: ', message);
  });
  socket.on('channel/join', function(message){
    var channel = message.channel;
    var current = channel.queue[channel.current];
    FLOWR.Channel.current = {
      index   : channel.current,
      content : current
    };
    if(current.type == 'video') FLOWR.Channel.set_video(current);
    FLOWR.Channel.comment(current.comment);
    var link = $('.channel-title').find('a');
    link.text(FLOWR.Channel.current.content.title);
    link.attr({ href : FLOWR.Channel.current.content.url, target : '_blank' });
  });
  socket.on('channel/next', function(message){
    FLOWR.Channel.current = message;
    FLOWR.Channel.move('next', message.content);
  });
  socket.on('channel/prev', function(message){
    FLOWR.Channel.current = message;
    FLOWR.Channel.move('prev', message.content);
  });
  socket.on('error', function(message){
    console.log('error');
  });
  $.each(['prev', 'next'], function(index, dir){
    $('.channel-' + dir).click(function(e){
      socket.emit('channel/' + dir, { 
        index   : FLOWR.Channel.current.index,
        channel : FLOWR.attribute.channel 
      });
    });
  });

  FLOWR.Zapping = {};
  FLOWR.Zapping.channel_array = [];
  FLOWR.Zapping.fav_array = [];
  FLOWR.Zapping.feedback = function(type, channel){
    var thumbnail = FLOWR.attribute.api + '/thumbnail?url=' + channel.current.url;
    $('#feedback').attr('title', type + ' / ' + channel.channel_id);
    $('#feedback').attr('data-content', FLOWR.View.Generator.feedback(thumbnail, channel.description));
    var message = { title : type + ' / ' + channel.channel_id, desc : channel.description };
    zapping_socket.emit('zapping/change', { key : 'feedback', value : message });
  };
  FLOWR.Zapping.can_sync = false;
  FLOWR.Zapping.current = {};
  FLOWR.Zapping.current_channel = null;
  FLOWR.Zapping.current_fav = null;
  FLOWR.Zapping.sync_video = function(){
    if(FLOWR.Channel.current == null || FLOWR.Channel.current.content.type != 'video') return;
    if(FLOWR.Channel.video == null || FLOWR.Channel.video.player == null) return;
    zapping_socket.emit('zapping/move', { key : 'sound', value : FLOWR.Channel.video.player.volume });
    zapping_socket.emit('zapping/move', { key : 'time', value : FLOWR.Channel.video.player.current_time });
  };
  FLOWR.Zapping.change_mode = function(name){
    zapping_socket.emit('zapping/change', { key : 'mode', value : name, content : FLOWR.Channel.current.content });
  };
  var zapping_socket = io.connect(FLOWR.attribute.host);
  if(FLOWR.attribute.user.exists){
    zapping_socket.emit('zapping/join', { 
      user : FLOWR.attribute.user,
      type : 'display'
    });
  }
  zapping_socket.on('zapping/display/join', function(message){
    FLOWR.Zapping.channel_array = message.channel_array;
    FLOWR.Zapping.fav_array = message.fav_array;
    var type = FLOWR.Channel.current.content.type;
    FLOWR.Zapping.change_mode(type);
  });
  zapping_socket.on('zapping/move', function(message){
    FLOWR.Zapping.current = message;
    FLOWR.Zapping.move[message.key](message.value);
  });
  zapping_socket.on('zapping/change', function(message){
    FLOWR.Zapping.change[message.key](message.value);
  });
  zapping_socket.on('error', function(message){
    console.log('error: ', message);
  });
  FLOWR.Zapping.move = {
    channel : function(value){
      var channel_array = FLOWR.Zapping.channel_array;
      var channel = channel_array[value % channel_array.length];
      FLOWR.Zapping.current_channel = channel;
      FLOWR.Zapping.feedback('チャンネル', channel);
      $('#feedback').popover('show');
    },
    scroll : function(value){
      console.log('zapping/scroll/move: ', value);
    },
    fav    : function(value){
      var fav_array = FLOWR.Zapping.fav_array;
      var fav = fav_array[value % fav_array.length];
      FLOWR.Zapping.current_fav = fav;
      FLOWR.Zapping.feedback('お気に入り', fav.channel_id, fav.channel_id + 'さんのチャンネルです');
      $('#feedback').popover('show');
    },
    time   : function(value){
      FLOWR.Channel.video.player.seek_to(FLOWR.Channel.video.player.duration * value / 100);
    },
    sound  : function(value){
      FLOWR.Channel.video.player.volume = value; 
    }
  };
  FLOWR.Zapping.change = {
    cancel : function(value){
      $('#feedback').popover('hide');
    },
    enter  : function(value){
      if(FLOWR.Zapping.current) FLOWR.Zapping.enter[FLOWR.Zapping.current.key]();
    }
  };
  FLOWR.Zapping.enter = {
    channel : function(){
      if(FLOWR.Zapping.current_channel){
        location.href = '/ch/' + FLOWR.Zapping.current_channel.channel_id;
      }
    },
    fav     : function(){
      if(FLOWR.Zapping.current_fav){
        location.href = '/ch/' + FLOWR.Zapping.current_fav.channel_id;
      }
    }
  };
});
