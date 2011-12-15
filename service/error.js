var service = module.exports = {
  render : function(res, message){
    res.render('pc/error.jade', {
      locals : { message : message || '' }
    });
  }
};
