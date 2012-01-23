var EventEmitter = require('events').EventEmitter;
var request = require('request');
var config  = require('../resource/config');

var service = module.exports = {
  get_info : function(url) {
    var ev = new EventEmitter();
    request.get({ uri : config.api + '/info?url=' + url }, function (error, response, body) {
      if(!error && response.statusCode == 200){
        var result = JSON.parse(body);
        if(result.is_success){
          ev.emit('end', result);
          request({
            method : 'POST',
            uri    : config.api + '/thumbnail?url=' + url 
          }, function (error, response, body){
            /* do nothing */
          });
        } else {
          ev.emit('error', result.message)
        }
      } else { 
        ev.emit('error', 'internal error', 500); 
      }
    });
    return ev;
  }
};
