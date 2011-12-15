/**
 * user collection
 */
db.users.drop();
db.users.save({ user_id : 'myatsumoto', name : 'akihiro matsumoto' });
for(var i=1;i<30;i++) {
    db.users.save({ user_id : 'ex_'+String(i), name : 'example_'+String(i) });
}

/**
 * page collection
 */
var user_id = db.users.findOne({ user_id : 'myatsumoto' })._id;
db.pages.drop();
db.pages.save({ title : 'myatsumoto.com', url : 'http://myatsumoto.com/', content : '', posted_by : user_id });
db.pages.save({ title : 'イチローレーザービーム', url : 'http://www.youtube.com/watch?v=l40Z1Na0X18', content : '', posted_by : user_id });
db.pages.save({ title : 'はてなブックマーク', url : 'http://b.hatena.ne.jp/', content : '', posted_by : user_id });
db.pages.save({ title : '畠山バースデー弾　ヤクルト７連勝', url : 'http://www.chunichi.co.jp/chuspo/article/npb/news/CK2011091402000095.html', content : '', posted_by : user_id });
db.pages.save({ title : 'image', url : 'http://www.sannichi.co.jp/kyodo/photoimg/2011091101000716/photo.jpg', content : '', posted_by : user_id });
db.pages.save({ title : 'pitecan.com', url : 'http://pitecan.com', content : '', posted_by : user_id });

/**
 * channel collection
 */
db.channels.drop();
var myatsumoto_id = db.users.findOne({ user_id : 'myatsumoto' })._id;
var pages = db.pages.find({ posted_by : myatsumoto_id });
db.channels.save({
    channel_id : 'myatsumoto',
    name : 'myatsumotoさんのチャンネル',
    queue : [{ content_id : pages[0]._id }, { content_id : pages[1]._id }, { content_id : pages[2]._id },{ content_id : pages[3]._id }, { content_id : pages[4]._id }, { content_id : pages[5]._id }],
    now : pages[0]._id,
    owner : myatsumoto_id,
    description : 'チャンネルの説明文を入力してください。' 
});
for(var i=1;i<30;i++) {
var ex_id = db.users.findOne({ user_id : 'ex_'+String(i) })._id;
db.channels.save({
    channel_id : 'ex_'+String(i),
    name : 'ex_'+String(i)+'さんのチャンネル',
    queue : [{ content_id : pages[0]._id }, { content_id : pages[1]._id }, { content_id : pages[2]._id },{ content_id : pages[3]._id }, { content_id : pages[4]._id }, { content_id : pages[5]._id }],
    now : pages[0]._id,
    owner : myatsumoto_id,
    description : 'チャンネルの説明文を入力してください。' 
});
}


