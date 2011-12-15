// FLOWR.View
$(function(){
  FLOWR.View = {};
});
// View General
$(function(){
  var space = 15;
  $('.fullsize-with-header').css({ margin : 0, padding : 0 });
  $('.fullsize-with-header').height($(window).height() - $('#header').height() - space);
  $(window).resize(function(e){
    var height =  e.currentTarget.innerHeight - $('#header').height() - space;
    $('.fullsize-with-header').css('height', height); 
    $('.fullsize-with-header .fullsize').css('height', height); 
  });
});
// View Generator
$(function(){
  var generator = {};
  generator.nav = function(list){
    var css = { cursor : 'pointer' };
    var nav = $('<ul />').attr('class', 'nav');
    $.each(list, function(index, item){
      var li = $('<li />').attr({ 'class' : item.cls });
      var a  = $('<a />').css(css).append(item.text);
      if('href' in item) a.attr({ href : item.href });
      nav.append(li.append(a));
    });
    return nav;
  };
  generator.frame = {
    page  : function(url){
      return FLOWR.Util.Tag.generate('iframe',
        {
          'src'          : url,
          'class'        : 'fullsize no-space',
          'frameborder'  : 0,
          'vspace'       : 0,
          'marginheight' : 0 
        }, null
      );
    },
    video : function(url){
      return FLOWR.Util.Tag.generate('div', { 'id' : 'player', 'class' : 'fullsize no-space' }, null);
    }
  };
  generator.feedback = function(description){
    var img = $('<img />').attr({ 'src' : 'http://placehold.it/210x150' });
    var info = $('<div />').attr('class', 'info');
    var desc = $('<div />').attr('clsss', 'description').text(description);
    info.append(desc);
    return $('<a />').append($('<div />').append(img).append(info)).html();
  };
  FLOWR.View.Generator = generator;
});
// View Parts
$(function(){
  var parts = {};
  parts.panel = {
    control : FLOWR.View.Generator.nav([
      { cls : 'channel-prev',  text : '<' },
      { cls : 'channel-title', text : ''  },
      { cls : 'channel-fav',   text : '★' },
      { cls : 'channel-next',  text : '>' }
    ]),
    message : FLOWR.View.Generator.nav([
      { cls : '', text : '', alt : '' }
    ]).css({ width :  '30%' })
  };
  FLOWR.View.Parts = parts;
});
