$(function(){
  FLOWR.Zapping = {};
  FLOWR.Zapping.size = 360;
  FLOWR.Zapping.radius = FLOWR.Zapping.size / 2;
  FLOWR.Zapping.canvas = $('<canvas/>').attr({
    id     : 'canvas',
    width  : FLOWR.Zapping.size,
    height : FLOWR.Zapping.size
  });
  FLOWR.Zapping.dial_option = {
    x      : FLOWR.Zapping.radius,
    y      : FLOWR.Zapping.radius,
    radius : FLOWR.Zapping.radius,
    color  : '#333',
    type   : 'fill'
  };
  FLOWR.Zapping.en_option = {
    x      : 0,
    y      : 0,
    radius : FLOWR.Zapping.radius / 4,
    color  : '#ff8c00',
    type   : 'fill'
  };
  FLOWR.Zapping.context = {
    sound    : { max : 100,  min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option },
    time     : { max : 100,  min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option },
    link     : { max : 9999, min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option },
    scroll   : { max : 9999, min : 0, value_by_rot :150, en : FLOWR.Zapping.en_option },
    channel  : { max : 9999, min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option },
    fav      : { max : 9999, min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option },
    friend   : { max : 9999, min : 0, value_by_rot : 50, en : FLOWR.Zapping.en_option }
  };
  FLOWR.Zapping.mode = {
    page  : ['channel', 'scroll', 'fav'],
    video : ['channel', 'sound', 'time']
  };
});
