var EventEmitter = require('events').EventEmitter;
var request = require('request');
var config  = require('../resource/config');

var service = module.exports = {
  get_info : function(url) {
    var ev = new EventEmitter();
    request({ uri : config.api + '/info?url=' + url }, function (error, response, body) {
      if(!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        result.is_success == true ? ev.emit('end', result) : ev.emit('error', result.message);
      } else { 
        ev.emit('error', 'internal error', 500); 
      }
    });
    return ev;
  }
};
