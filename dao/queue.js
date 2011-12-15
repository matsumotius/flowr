var EventEmitter = require('events').EventEmitter;
var Channel = require('../model/channel');
 
var dao = module.exports = {
  push : function(id, content) {
    var ev = new EventEmitter();
    Channel.findById(id, [], {}, function(error, channel) {
      if(!error) {
        channel.queue.push(content);
        channel.save(function(error) {
          error ? ev.emit('error') : ev.emit('end', channel);
        });
      } else {
        console.log('queue_dao/push:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  insert : function(id, index, content) {
    var ev = new EventEmitter();
    Channel.findById(id, [], {}, function(error, channel) {
      if(!error) {
        var right = [content].concat(channel.queue.slice(index));
        channel.queue = channel.queue.slice(0, index).concat(right);
        channel.save(function(error) {
          error ? ev.emit('error') : ev.emit('end', channel);
        });
      } else {
        console.log('queue_dao/insert:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  remove : function(id, index) {
    var ev = new EventEmitter();
    Channel.findById(id, [], {}, function(error, channel) {
      if(!error) {
        channel.queue.splice(index, 1);
        channel.save(function(error) {
            error ? ev.emit('error') : ev.emit('end', channel);
        });
      } else {
        console.log('queue_dao/remove:', error);
        ev.emit('error');
      }
    });
    return ev;
  },
  swap : function(id, a_index, b_index) {
    var ev = new EventEmitter();
    Channel.findById(id, [], {}, function(error, channel) {
      if(!error) {
        var tmp = channel.queue[a_index];
        channel.queue[a_index] = channel.queue[b_index];
        channel.queue[b_index] = tmp;
        channel.save(function(error) {
          error ? ev.emit('error') : ev.emit('end', channel);
        });
      } else {
        console.log('queue_dao/swap:', error);
        ev.emit('error');
      }
    });
    return ev;
  }
};
