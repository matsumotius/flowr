var $ = require('jquery');
var service = module.exports = {
  get_type : function(req){
    var UA = req.headers['user-agent'];
    return UA.match(/iPhone/) || UA.match(/iPad/) || UA.match(/Android/) ? 'mobile' : 'pc';
  },
  has_user : function(session){
    return 'user' in session;
  },
  get_user : function(req){
    var guest = { exists : false, _id : '', user_id : '', name : '', joined_at : '' };
    return 'user' in req.session ? $.extend({ exists : true }, req.session.user) : guest;
  }
};
