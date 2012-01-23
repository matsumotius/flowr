$(function(){
  $('#feedback-detail').css({ 'text-align' : 'center' });
  $('#footer .zapping').addClass('ui-btn-active');
  $('#input').append(FLOWR.Zapping.canvas);
  FLOWR.Zapping.dial = $('#canvas').context_dial(FLOWR.Zapping.dial_option);
  FLOWR.Zapping.set_mode = function(mode){
    if(false == mode in FLOWR.Zapping.mode) return;
    $.each(FLOWR.Zapping.mode[mode], function(index, key){
      var context = FLOWR.Zapping.context[key];
      FLOWR.Zapping.dial.add(key, context);
      FLOWR.Zapping.dial.set_image(key, {
        url    : '/image/' + key + '.png',
        width  : FLOWR.Zapping.en_option.radius,
        height : FLOWR.Zapping.en_option.radius
      });
    });
  };
  FLOWR.Zapping.feedback = function(content){
    if(null == content || undefined == content) return;
    var thumbnail_url = FLOWR.attribute.api + '/thumbnail?url=' + content.current.url;
    $('#feedback .title').text(content.title);
    $('#feedback .thumbnail-image').attr('src', thumbnail_url);
  };
  FLOWR.Zapping.remove_mode = function(mode){
    if(false == mode in FLOWR.Zapping.mode) return;
    $.each(FLOWR.Zapping.mode[mode], function(index, key){
      FLOWR.Zapping.dial.remove(key);
    });
  };
  FLOWR.Zapping.set_mode('page');
  var socket = io.connect(FLOWR.attribute.host);
  socket.emit('zapping/join', {
    user : FLOWR.attribute.user,
    type : 'zapping'
  });
  socket.on('zapping/join', function(message){
    // console.log(message);
  });
  socket.on('zapping/move', function(message){
    FLOWR.Zapping.dial.set_value(message.key, message.value);
  });
  socket.on('zapping/change', function(message){
    var reverse = function(v){ return v == 'video' ? 'page' : 'video'; };
    if(message.key == 'mode'){
      FLOWR.Zapping.remove_mode(reverse(message.value));
      FLOWR.Zapping.remove_mode(message.value);
      FLOWR.Zapping.set_mode(message.value);
    } else if(message.key == 'feedback'){
      FLOWR.Zapping.feedback(message.value);
    }
  });
  socket.on('error', function(message){
    console.log('error: ', message);
  });
  FLOWR.Zapping.dial.on('change', function(context){
    socket.emit('zapping/move', { key : context.key, value : parseInt(context.value) });
  });
  FLOWR.Zapping.dial.on('touchend', function(context){});
  $('#cancel').tap(function(e){
    socket.emit('zapping/change', { key : 'cancel', value : 1 });
  });
  $('#enter').tap(function(e){
    socket.emit('zapping/change', { key : 'enter', value : 1 });
  });
});
