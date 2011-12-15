var $ = require('jquery');
var service = module.exports = {
  has_user : function(session){
    return 'user' in session;
  },
  get_user : function(req){
    var guest = { exists : false, _id : '', user_id : '', name : '', joined_at : '' };
    return 'user' in req.session ? $.extend({ exists : true }, req.session.user) : guest;
  }
};
