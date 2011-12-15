$(function() {
  FLOWR.Util = {};
  FLOWR.Util.Tag = {
    BLANK : ' ',
    double_quotes : function(val) {
      return '\"'+val+'\"';
    },
    generate : function(name, attr, val) {
      if(!name) return '';
      var tag_string = '<' + name;
      for(var key in attr) {
          tag_string += this.BLANK + key + '=' + this.double_quotes(attr[key]);
      }
      tag_string += '>';
      tag_string += ((val) ? val : '');
      tag_string += '</' + name + '>';
      return tag_string;
    }
  };
  FLOWR.Util.is_empty = function(val) {
    return (val === undefined || val === null || val === '' || val === NaN);
  };
  FLOWR.Util.error = function(message, level) {
    throw message;
  };
  // todo: fix this crazy code.
  FLOWR.Util.guess_type = function(url) {
    var yt_exp = new RegExp("^http:\/\/(www\.)?youtube\.com\/(watch\/|embed\/|watch\/v\/|watch\\?v=)[_a-zA-Z0-9&=\?-]+");
    var is_yt = url.match(yt_exp)? true : false;
    var image_exp = new RegExp("^http(s)?:\/\/.*\/(.*)\.(jpg|png|gif)$");
    var is_image = url.match(image_exp)? true : false;
    if(is_yt) { return 'youtube'; }
    else if(is_image) { return 'image' }
    else { return 'page' }
  };
  FLOWR.Util.countdown = function(sec, internal, finished) {
    var limit = parseInt(sec);
    var count = 0;
    var counter = setInterval(function() {
      count++;
      if(count < limit) {
        if(FLOWR.Util.is_empty(internal) === false) internal(count, limit);
      } else {
        if(FLOWR.Util.is_empty(finished) === false) finished(count, limit);
        clearInterval(counter);
      }
    }, 1000);
  };
});
