var EventEmitter = require('events').EventEmitter;
var crawler_service = require('./crawler');
var user_service = require('../service/user');

var service = module.exports = {
  save_by_url : function(user_id, url) {
    var ev = new EventEmitter();
    var search_user = user_service.find_by_user_id(user_id);
    search_user.on('end', function(user) {
      var get_info = crawler_service.get_info(url);
      get_info.on('end', function(info) {
        var save_content = queue_service.post(user._id, {
          url : info.page.url,
          title : info.page.title,
          content : info.page.comment,
          posted_by : user._id 
        });
        save_content.on('end', function(content) { ev.emit('end', content); });
        save_content.on('error', function() { ev.emit('error', 'internal error', 500); });
      });
      get_info.on('error', function() { ev.emit('error'); });
    });
    search_user.on('error', function(message, code) { ev.emit('error'); });
    return ev;
  },
  find_by_id : function(id) {
    var ev = new EventEmitter();
    var search_page = page_dao.find_by_id(id);
    search_page.on('end', function(page) { ev.emit('end', page); });
    search_page.on('error', function() { ev.emit('error'); });
    return ev;
  },
  find_by_user_id : function(user_id) {
    var ev = new EventEmitter();
    var search_user = user_service.find_by_user_id(user_id);
    search_user.on('end', function(user) {
      var search_page = page_dao.find({ posted_by : user.id });
      search_page.on('end', function(page) { ev.emit('end', page); });
      search_page.on('error', function() { ev.emit('error'); });
    });
    search_user.on('error', function() { ev.emit('error'); });
    return ev;
  }
};
