$(function(){
  $('#feedback').popover({
    animate   : false,
    html      : true,
    placement : 'below',
    trigger   : 'manual',
    offset    : 30
  });
  $('#control').append(FLOWR.Dial.canvas);
  $('.enter').live('click', function(e){
    var channel = FLOWR.Demo.channel.all[FLOWR.Demo.context.channel];
    FLOWR.Demo.channel.change(channel.channel_id);
    $('#feedback').popover('hide');
  });
  $('.cancel').live('click', function(e){
    $('#feedback').popover('hide');
  });
  FLOWR.Demo = {};
  FLOWR.Demo.frame = $('#content-frame');
  FLOWR.Demo.frame.css({
    width  : '100%',
    height : $(window).innerHeight() - 5
  });
  FLOWR.Demo.queue = FLOWR.Demo.frame.fusuma();
  FLOWR.Demo.dial = $('#canvas').context_dial(FLOWR.Dial.option);
  FLOWR.Demo.set_mode = function(mode){
    if(false == (mode in FLOWR.Dial.mode)) return;
    if(FLOWR.Demo.current.mode) FLOWR.Demo.remove_mode(FLOWR.Demo.current.mode);
    FLOWR.Demo.current.mode = mode;
    $.each(FLOWR.Dial.mode[mode], function(index, key){
      var context = FLOWR.Dial.context[key];
      FLOWR.Demo.dial.add(key, context);
      FLOWR.Demo.dial.set_image(key, {
        url    : '/image/' + key + '.png',
        width  : FLOWR.Dial.en_option.radius,
        height : FLOWR.Dial.en_option.radius
      });
    });
  };
  FLOWR.Demo.remove_mode = function(mode){
    if(false == (mode in FLOWR.Dial.mode)) return;
    $.each(FLOWR.Dial.mode[mode], function(index, key){
      FLOWR.Demo.dial.remove(key);
    });
  };
  FLOWR.Demo.current = {
    mode  : null
  };
  FLOWR.Demo.context = {};
  FLOWR.Demo.channel = {
    index    : null,
    now      : null,
    all      : null,
    change   : function(id){
      FLOWR.Demo.request.user(id, function(channel){
        FLOWR.Demo.channel.now = channel;
        FLOWR.Demo.set_channel(channel.queue[channel.current]);
      });
    },
    feedback : function(channel){
      var thumbnail = 'http://flowr.jp:8080/page/thumbnail?url=' + channel.current.url;
      $('#feedback').attr('title', channel.channel_id);
      $('#feedback').attr('data-content', FLOWR.View.Generator.demo_feedback(thumbnail, channel.description));
      $('#feedback').popover('show');
    }
  };
  FLOWR.Demo.set_video = function(content){
    var option = { width : $(window).innerWidth(), height : $(window).innerHeight() };
    FLOWR.Demo.video = $('#player').ganpuku(content.url, option);
    FLOWR.Demo.video.on_load(function(){
      FLOWR.Demo.video.on('ready', function(){
        FLOWR.Demo.dial.set_value('sound', FLOWR.Demo.video.player.volume);
        FLOWR.Demo.video.player.play(); 
      });
    });
    FLOWR.Demo.set_mode('video');
  };
  FLOWR.Demo.set_page  = function(content){
    FLOWR.Demo.set_mode('page');
  };
  FLOWR.Demo.set_channel = function(content){
    FLOWR.Demo.set_content('prev', content);
    FLOWR.Demo.queue.remove(FLOWR.Demo.queue.current);
  };
  FLOWR.Demo.set_content = function(dir, content){
    FLOWR.Demo.video = null;
    FLOWR.Demo.context = {};
    var frame = FLOWR.View.Generator.frame[content.type](content.url);
    FLOWR.Demo.queue.add(frame).to(dir);
    if(content.type == 'page'){
      FLOWR.Demo.set_page(content);
    } else {
      FLOWR.Demo.set_video(content);
    }
  };
  FLOWR.Demo.request = {
    user : function(id, callback){
      $.ajax({
        type     : 'GET',
        url      : '/api/ch/' + id,
        dataType : 'json',
        success  : function(req){ if(req.is_success) callback(req.data); }
      });
    },
    all  : function(callback){
      $.ajax({
        type     : 'GET',
        url      : '/api/ch/all',
        dataType : 'json',
        success  : function(req){ if(req.is_success) callback(req.data); }
      });
    }
  };
  FLOWR.Demo.feedback = {
    sound   : function(diff, value){
      if(null == FLOWR.Demo.video) return;
      FLOWR.Demo.video.player.volume = value;
    },
    time    : function(diff, value){
      if(null == FLOWR.Demo.video) return;
      var diff_time    = FLOWR.Demo.video.player.duration * diff / 100;
      var current_time = FLOWR.Demo.video.player.current_time;
      FLOWR.Demo.video.player.seek_to(current_time + diff_time);
    },
    channel : function(diff, value){
      var channel = FLOWR.Demo.channel.all[value];
      FLOWR.Demo.channel.feedback(channel);
    }
  };
  FLOWR.Demo.request.all(function(req){ 
    FLOWR.Demo.channel.all = req; 
  });
  FLOWR.Demo.channel.change('myatsumoto');
  FLOWR.Demo.dial.on('change', function(context){
    var value = parseInt(context.value);
    if(false == (context.key in FLOWR.Demo.context)){
      FLOWR.Demo.feedback[context.key](value, value);
    } else {
      var diff = value - FLOWR.Demo.context[context.key];
      if(diff != 0){ FLOWR.Demo.feedback[context.key](diff, value); }
    }
    FLOWR.Demo.context[context.key] = value;
  });
});
