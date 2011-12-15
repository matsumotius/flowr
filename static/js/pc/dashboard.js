$(function(){
  // check zapping || channel
  $('#timeline').sortable();
  $('#timeline').disableSelection();
  $('#operation-list .access').css({ color : 'red', 'font-size' : '24px' });
  $('#post .url').focus(function(e){ $('#post .comment').removeClass('hidden'); });
  FLOWR.Dashboard = {};
  FLOWR.Dashboard.focus = { index : -1, id : null, url : null, title : null, posted_at : null };
  FLOWR.Dashboard.dragging = { index : -1 };
  FLOWR.Dashboard.current = {};
  FLOWR.Dashboard.set_current = function(current){
    $($('#timeline .content')[current.index]).addClass('now');
    $('#current .info').text(current.content.title);
    $('#content-detail .content-title').text(current.content.title);
    $('#content-detail .content-posted_at').text(current.content.posted_at);
    FLOWR.Dashboard.current = {
      index   : current.index,
      content : current.content
    };
  };
  FLOWR.Dashboard.adjust_timeline = function(){
    $('#timeline').width(($('#timeline li').length + 1) * $('#timeline li').width());
  };
  var socket = io.connect(FLOWR.attribute.host);
  socket.emit('control/join', {
    user    : FLOWR.attribute.user,
    channel : FLOWR.attribute.channel
  });
  socket.on('control/join', function(message){
    var channel = message.channel;
    FLOWR.Dashboard.current = {
      index   : channel.current,
      content : channel.queue[channel.current]
    };
    FLOWR.Dashboard.focus.index = channel.current;
  });
  socket.on('control/prev', function(message){
    $('#timeline .content').removeClass('now');
    FLOWR.Dashboard.set_current(message);
  });
  socket.on('control/next', function(message){
    $('#timeline .content').removeClass('now');
    FLOWR.Dashboard.set_current(message);
  });
  socket.on('control/move', function(message){
    console.log(message);
  });
  socket.on('control/remove', function(message){
    $($('#timeline li')[message.index]).remove();
    FLOWR.Dashboard.adjust_timeline();
  });
  socket.on('control/update', function(message){
    console.log('update: ', message);
    if(message.key == 'access'){
      $('#operation-list .access').text(message.value);
    }
  });
  socket.on('error', function(message){
    console.log(message);
  });
  $('#content-detail .content-delete').click(function(e){
    socket.emit('control/remove', {
      index   : FLOWR.Dashboard.focus.index,
      channel : FLOWR.attribute.channel
    });
  });
  $('#content-detail .content-delete').css('cursor', 'pointer');
  $('#operation-list .next').css('cursor', 'pointer');
  $('#operation-list .prev').css('cursor', 'pointer');
  $('#operation-list .next').click(function(e){
    socket.emit('control/next', {
      index   : FLOWR.Dashboard.current.index,
      channel : FLOWR.attribute.channel
    });
  });
  $('#operation-list .prev').click(function(e){
    socket.emit('control/prev', {
      index   : FLOWR.Dashboard.current.index,
      channel : FLOWR.attribute.channel
    });
  });
  var dragging = false;
  FLOWR.Dashboard.adjust_timeline();
  $('#timeline').bind('sortupdate', function(e, ui){
    socket.emit('control/move', {
      channel : FLOWR.attribute.channel,
      before  : FLOWR.Dashboard.dragging.index,
      after   : $('#timeline li').index(ui.item.context)
    });
  });
  $('#timeline').bind('sortstart', function(e, ui){
    dragging = true;
    FLOWR.Dashboard.dragging = { index : $('#timeline li').index(ui.item.context) };
  });
  $('#timeline').bind('sortstop', function(e, ui){
    dragging = false;
  });
  $('#timeline .content').mouseover(function(e){
    if(dragging) return;
    if(FLOWR.Dashboard.focus.id == $(this).find('.content-id').attr('value')) return;
    var content = { 
      id : $(this).find('.content-id').attr('value'),
      url : $(this).find('.content-url').attr('value'),
      title : $(this).find('.content-title').attr('value'),
      posted_at : $(this).find('.content-posted_at').attr('value')
    };
    $('#timeline .focus').removeClass('focus');
    $(this).addClass('focus');
    $('#content-detail .content-title').text(content.title);
    $('#content-detail .content-posted_at').text(content.posted_at);
    FLOWR.Dashboard.focus = content;
    FLOWR.Dashboard.focus.index = $('#timeline li').index(e.currentTarget);
  });
});
