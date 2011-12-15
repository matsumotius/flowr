var Mongoose = require('mongoose');
var mongoose = new Mongoose.Mongoose();
var db = mongoose.connect('mongodb://localhost:27017/flowr');

var Schema = Mongoose.Schema;
var Favorite = {
  channel_id : { type : String, required : true }
};
var User = new Schema({
  user_id   : { type : String, required : true },
  name      : { type : String, required : true },
  password  : { type : String, required : true },
  thumbnail : { type : Number, default : -1 },
  fav       : [Favorite],
  profile   : { type : String, default : '' },
  joined_at : { type : Date, default : Date.now }
});

mongoose.model('users', User, 'users', false);
module.exports = db.model('users');
