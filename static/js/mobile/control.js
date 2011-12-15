$(function(){
  FLOWR.Control = {};
  FLOWR.Control.current = {};
  $('#footer .control').addClass('ui-btn-active');
  var socket = io.connect(FLOWR.attribute.host);
  socket.emit('control/join', {
    user    : FLOWR.attribute.user,
    channel : FLOWR.attribute.channel
  });
  socket.on('error', function(message){
    console.log(message);
  });
  socket.on('control/join', function(message){
    var channel = message.channel;
    FLOWR.Control.current = {
      index   : channel.current,
      content : channel.queue[channel.current]
    };
    $('#current .title').text(FLOWR.Control.current.content.title);
  });
  socket.on('control/next', function(message){
    $('#current .title').text(message.content.title);
  });
  socket.on('control/prev', function(message){
    $('#current .title').text(message.content.title);
  });
  $('#control-panel .next').tap(function(e){
    socket.emit('control/next', {
      index   : FLOWR.Control.current.index,
      channel : FLOWR.attribute.channel
    });
  });
  $('#control-panel .prev').tap(function(e){
    socket.emit('control/prev', {
      index   : FLOWR.Control.current.index,
      channel : FLOWR.attribute.channel
    });
  });
});
