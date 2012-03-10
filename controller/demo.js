/**
 * Demo Controller
 */
var demo = module.exports = {
  get : function(req, res){
    res.render('mobile/demo.jade', { locals : {} });
  }
};
