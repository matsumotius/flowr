/**
 * user collection
 */
db.users.drop();
db.users.save({ user_id : 'annin', name : 'annin dofu' });
db.users.save({ user_id : 'mabo', name : 'mabo dofu' });
for(var i=1;i<100;i++){
  db.users.save({ user_id : 'flowr_' + i, name : 'flowr_' + i });
}
var fav_array = []
for(var i=75;i<100;i++){
  fav_array.push({ channel_id : 'flowr_' + i });
}
db.users.save({
  user_id  : 'myatsumoto',
  name     : 'akihiro matsumoto',
  password : 'd74ea65d1c9ebd13775cde14620bcb85',
  fav      : fav_array
});
/**
 * page collection
 */
var a = { title : 'myatsumoto.com', url : 'http://myatsumoto.com/',    type : 'page', content : '...', comment : 'あんまり面白くない' };
var b = { title : 'apple',          url : 'http://apple.com/',         type : 'page', content : '...' };
var c = { title : 'otsune tumblr',  url : 'http://otsune.tumblr.com/', type : 'page', content : '...' };
var d = { title : 'Apple - iTunes - The Beatles - TV Ad - Covers',  url : 'http://www.youtube.com/watch?v=ychmsJR6Rkk', type : 'video', content : '...' };
var e = { title : 'Apple iPad TV ad - iPad is Delicious',  url : 'http://www.youtube.com/watch?v=btfbIVGES1I', type : 'video', content : '...' };
/**
 * channel collection
 */
db.channels.drop();
var myatsumoto_id = db.users.findOne({ user_id : 'myatsumoto' })._id;
db.channels.save({
  channel_id  : 'myatsumoto',
  name        : 'myatsumotoさんのチャンネル',
  queue       : [a, b, c],
  current     : 1,
  owner       : myatsumoto_id,
  description : '',
  fav         : 0,
  access     : 0
});
for(var i=1;i<100;i++){
  var flowr_user = db.users.findOne({ user_id : 'flowr_' + i });
  db.channels.save({
    channel_id  : flowr_user.user_id,
    name        : flowr_user.user_id + 'さんのチャンネル',
    queue       : [a, b, c, d, e],
    current     : 3,
    owner       : flowr_user._id,
    description : flowr_user.user_id + 'さんのチャンネルです',
    fav         : 0,
    access     : 0
  });
}
