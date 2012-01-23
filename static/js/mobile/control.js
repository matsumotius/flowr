$(function(){
  FLOWR.Control = {};
  FLOWR.Control.current = {};
  FLOWR.Control.feedback = function(content){
    var thumbnail_url = FLOWR.attribute.api + '/thumbnail?url=' + content.url;
    $('#current .title').text(content.title);
    $('#current .thumbnail-image').attr('src', thumbnail_url);
  };
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
    FLOWR.Control.feedback(FLOWR.Control.current.content);
  });
  socket.on('control/next', function(message){
    FLOWR.Control.feedback(message.content);
  });
  socket.on('control/prev', function(message){
    FLOWR.Control.feedback(message.content);
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
