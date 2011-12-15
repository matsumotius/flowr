var Mongoose = require('mongoose');
var mongoose = new Mongoose.Mongoose();
var db = mongoose.connect('mongodb://localhost:27017/flowr');

var Schema = Mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Content = new Schema({
  url       : { type : String, required : true },
  title     : { type : String, required : true },
  type      : { type : String, default : 'page' },
  comment   : { type : String, default : '' },
  thumbnail : { type : Number, default : -1 },
  fav       : { type : Number, default : 0 },
  access    : { type : Number, default : 0 },
  posted_at : { type : Date, default : Date.now }
});

var Channel = new Schema({
  channel_id  : { type : String, required : true, index : { unique : true } },
  name        : { type : String, required : true },
  description : { type : String, default : '' },
  current     : { type : Number, default : -1 },
  fav         : { type : Number, default : 0 },
  access      : { type : Number, default : 0 },
  updated_at  : { type : Date, default : Date.now },
  owner       : { type : ObjectId, required : true },
  queue       : [Content]
});

mongoose.model('channels', Channel, 'channels', false);
module.exports = db.model('channels');

