/**
 * Demo Controller
 */
var demo = module.exports = {
  get : function(req, res){
    res.render('pc/demo.jade', { locals : {} });
  }
};
