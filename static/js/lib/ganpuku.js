var onYouTubePlayerAPIReady;
(function($){
    var exp = {
        youtube : new RegExp("^http:\/\/(www\.)?youtube\.com\/(watch\/|embed\/|watch\/v\/|watch\\?v=)([_a-zA-Z0-9&=\?-]+)"),
        vimeo : new RegExp("^http:\/\/(www\.)?vimeo\.com\/([_a-zA-Z0-9&=\?-]+)")
    };
    var get_type = function(url){
        var hostname_list = { 'youtube.com' : 'youtube', 'vimeo.com' : 'vimeo' };
	var hostname = url.match(new RegExp('^(?:f|ht)tp(?:s)?\://(www\.)?([^/]+)', 'im'));
	if(null == hostname) throw 'Invalid URL';
	return type = hostname[2] in hostname_list ? hostname_list[hostname[2]] : 'html5';
    };
    var get_video = function(type, url){
        if(type == 'html5')   return url;
        if(type == 'youtube') return url.match(exp.youtube)[3]; 
        if(type == 'vimeo')   return url.match(exp.vimeo)[2]; 
    };
    var parse = function(url){
        var type  = get_type(url);
        var video = get_video(type, url);
        return { type : type, video : video };
    };
    var default_options = {
        html5   : { width : 600, height : 400 },
        vimeo   : { width : 600, height : 400 },
        youtube : { width : 600, height : 400 }
    };
    var create_player = {
        html5   : function(id, params){ return new HTML5(id, params); },
        vimeo   : function(id, params){ return new Vimeo(id, params); },
        youtube : function(id, params){ return new YouTube(id, params); }
    };
    var is_function = function(obj){ return !!(obj && obj.constructor && obj.call && obj.apply); };
    var player_events =  ['ready', 'play', 'pause', 'end', 'error'];
    var player_methods = ['play', 'pause', 'stop', 'seek_to', 'mute', 'unmute'];
    // parent object
    var Player = function(){
        this.events = {};
        for(var i=0;i<player_events.length;i++) this.events[player_events[i]] = [];
    };
    Player.prototype.clear = function(){
        for(var i=0;i<player_events.length;i++) this.events[player_events[i]] = [];
    };
    Player.prototype.on = function(ev, callback){
        if(ev in this.events) this.events[ev].push(callback);
    };
    Player.prototype.fire = function(ev, params){
        if(false === ev in this.events) return;
        for(var i=0;i<this.events[ev].length;i++) this.events[ev][i](params);
    };
    var HTML5 = function(id, params){
        this.id = id;
        this.video = params.video;
        this.width = params.width;
        this.height = params.height;
        this.video_tag = $('<video>').attr('width', this.width).
                                      attr('height', this.height).
                                      attr('controls', 'controls');
        this.video_tag.append($('<source>').attr('src', this.video));
        $('#'+this.id).append(this.video_tag);
        this.player = $('#'+this.id).find('video')[0];
        this.vol = this.player.volume;
        this.__defineGetter__('volume', function(){ return this.player.volume; });
        this.__defineSetter__('volume', function(v){ this.player.volume = v; });
        var html5_events = { canplay : 'ready', play : 'play', pause : 'pause', ended : 'end', error : 'error' };
        var that = this;
        for(var key in html5_events){
            $(this.player).bind(key, function(e){ that.fire(html5_events[e.type]); });
        }
    };
    HTML5.prototype = new Player();
    HTML5.prototype.play = function(){ this.player.play(); };
    HTML5.prototype.pause = function(){ this.player.pause(); };
    HTML5.prototype.seek_to = function(value){ this.player.currentTime = value; };
    HTML5.prototype.mute = function(){ this.volume = 0; };
    HTML5.prototype.unmute = function(){ this.volume = this.vol; };
    var Vimeo = function(id, params){
        this.id = id;
        this.video = params.video;
        this.width = params.width;
        this.height = params.height;
        this.src = 'http://player.vimeo.com/video/'+this.video+'?api=1';
        this.iframe = $('<iframe>').attr('src', this.src).
                                    attr('width', this.width).
                                    attr('height', this.height).
                                    attr('frameborder', 0);
        $('#'+this.id).append(this.iframe);
        this.vol = 0;
        this.is_mute = false;
        this.__defineGetter__('volume', function(v){ return this.is_mute ? 0 : this.vol; });
        this.__defineSetter__('volume', function(v){
            this.order('setVolume', v); 
            this.vol = v; 
            return this.vol;
        });
        var vimeo_events = { ready : 'ready', pause : 'pause', play : 'play', finish : 'end' };
        var that = this;
        this.callbacks = { ready : function(v){ that.initialize(); } };
        window.addEventListener('message', function(v){ 
            var data = JSON.parse(v.data);
            if('event' in data && data.event in that.callbacks){
                that.callbacks[data.event]();
                if(data.event in vimeo_events) that.fire(vimeo_events[data.event], that);
            }
            if('method' in data && data.method in that.callbacks){
                that.callbacks[data.method](data.value);
            }
        });
    };
    Vimeo.prototype = new Player();
    Vimeo.prototype.initialize = function(){
        var that = this;
        this.order('getVolume', function(value){ that.vol = value; });
    };
    Vimeo.prototype.order = function(method, value){
        if(!method) return;
        if(is_function(value)) this.callbacks[method] = value;
        var msg = { method : method, value : (is_function(value) || !value) ?  '' : value };
        var vimeo = $('#'+this.id).find('iframe')[0];
        vimeo.contentWindow.postMessage(JSON.stringify(msg), $(vimeo).attr('src').split('?')[0]);
    };
    Vimeo.prototype.play = function(){ this.order('play'); };
    Vimeo.prototype.pause = function(){ this.order('pause'); };
    Vimeo.prototype.seek_to = function(value){ this.order('seekTo', value); };
    Vimeo.prototype.mute = function(){
        if(this.is_mute) return;
        var that = this;
        this.order('getVolume', function(value){
            that.vol = value;
            that.order('setVolume', 0);
        });
        this.is_mute = true;
    };
    Vimeo.prototype.unmute = function(){
        if(false === this.is_mute) return;
        var that = this;
        this.order('getVolume', function(value){
            if(value > 0) that.vol = value;
            that.order('setVolume', that.vol);
        });
        this.is_mute = false;
    };
    var YouTube = function(id, params){
        if(false == api.is_loaded) throw 'API library is not loaded';
        this.id = id;
        this.video = params.video;
        this.width = params.width;
        this.height = params.height;
        this.player = new YT.Player(id, {
            width      : this.width,
	    height     : this.height, 
	    videoId    : this.video,
            playerVars : { wmode : 'transparent' }
        });
        var that = this;
        this.player.addEventListener('onReady', function(ev){ that.fire('ready'); });
        this.player.addEventListener('onStateChange', function(ev){
            var state = { '0' : 'end', '1' : 'play', '2' : 'pause' };
            that.fire(state[String(ev.data)]);
        });
        this.player.addEventListener('onError', function(ev){ that.fire('error'); });
        this.__defineGetter__('volume', function() { return this.player.getVolume(); });
        this.__defineSetter__('volume', function(v){ this.player.setVolume(v); });
        this.__defineGetter__('is_mute', function(){ return this.player.isMuted(); });
        this.__defineGetter__('duration', function() { return this.player.getDuration(); });
        this.__defineGetter__('current_time', function() { return this.player.getCurrentTime(); });
    };
    YouTube.prototype = new Player();
    YouTube.prototype.play = function(){ this.player.playVideo(); };
    YouTube.prototype.pause = function(){ this.player.stopVideo(); };
    YouTube.prototype.seek_to = function(value){ this.player.seekTo(value); };
    YouTube.prototype.mute = function(){ this.player.mute(); };
    YouTube.prototype.unmute = function(){ this.player.unMute(); };
    var Ganpuku = function(target, url, options){
        this.player;
        this.params;
        this.url = url;
        this.options = options;
        this.id = $(target).attr('id');
        this.load_callback = [];
    };
    Ganpuku.prototype.initialize = function(){
        var parsed = parse(this.url);
        this.video = parsed.video;
        this.type  = parsed.type;
        this.options = $.extend(default_options[this.type], this.options);
        this.params  = $.extend(this.options, { video : this.video });
        this.player  = create_player[this.type](this.id, this.params);
        for(var i=0;i<this.load_callback.length;i++) this.load_callback[i]();
    };
    Ganpuku.prototype.on = function(ev, callback){
        this.player.on(ev, callback);
    };
    Ganpuku.prototype.on_load = function(callback){
        this.load_callback.push(callback);
    };
    Ganpuku.prototype.change = function(url){
        if(!this.player || !url) return;
        if(this.type == 'html5'){ $('#'+this.id).find('video').remove(); }
        else{ $('#'+this.id).find('iframe').remove(); }
        this.player.clear(); // todo: remove
        this.url = url;
        this.initialize();
    };
    var api = {
        load : function(){
            var api_url = 'http://www.youtube.com/player_api';
            var api_is_loaded = $('script').attr('src').indexOf(api_url) > -1;
            var api = $('<script />').attr('type', 'text/javascript').attr('src', api_url);
            if(!api_is_loaded) $('head').append(api); 
        },
        list : { youtube : false }
    };
    api.__defineGetter__('is_loaded', function(){
        for(var key in api.list){ if(false == api.list[key]) return false; }
        return true;
    });
    onYouTubePlayerAPIReady = function(){
        api.list.youtube = true;
        if(api.is_loaded && ganpuku) ganpuku.initialize();
    };
    var ganpuku = null;
    $.fn.ganpuku = function(url, options){
        api.load();
        // todo: apply type "url" or "id"
        if($(this).attr('id')) ganpuku = new Ganpuku(this, url, options)
        if(api.is_loaded) ganpuku.initialize();
        return ganpuku;
    };
})(jQuery);
