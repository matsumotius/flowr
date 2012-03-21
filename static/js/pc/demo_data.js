$(function(){
  FLOWR.Dial = {};
  FLOWR.Dial.size = 240;
  FLOWR.Dial.radius = FLOWR.Dial.size / 2;
  FLOWR.Dial.canvas = $('<canvas/>').attr({
    id     : 'canvas',
    width  : FLOWR.Dial.size,
    height : FLOWR.Dial.size
  });
  FLOWR.Dial.option = {
    x      : FLOWR.Dial.radius,
    y      : FLOWR.Dial.radius,
    radius : FLOWR.Dial.radius,
    color  : '#333',
    type   : 'fill'
  };
  FLOWR.Dial.en_option = {
    x      : 0,
    y      : 0,
    radius : FLOWR.Dial.radius / 4,
    color  : '#ff8c00',
    type   : 'fill'
  };
  FLOWR.Dial.context = {
    sound    : { max : 100,  min : 0,     value_by_rot : 50, en : FLOWR.Dial.en_option },
    time     : { max : 9999, min : -9999, value_by_rot : 50, en : FLOWR.Dial.en_option },
    link     : { max : 9999, min : 0,     value_by_rot : 50, en : FLOWR.Dial.en_option },
    scroll   : { max : 9999, min : 0,     value_by_rot :150, en : FLOWR.Dial.en_option },
    channel  : { max : 9999, min : 0,     value_by_rot : 50, en : FLOWR.Dial.en_option },
    fav      : { max : 9999, min : 0,     value_by_rot : 50, en : FLOWR.Dial.en_option },
    friend   : { max : 9999, min : 0,     value_by_rot : 50, en : FLOWR.Dial.en_option }
  };
  FLOWR.Dial.mode = {
    page  : ['channel'],
    video : ['channel', 'sound', 'time']
  };
});
