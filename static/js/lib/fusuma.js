(function($) {
    var Tag = {
        BLANK : ' ',
        double_quotes : function(val) {
            return '\"'+val+'\"';   
        },
        generate : function(name, attr, val) {
            if(!name) return '';
            var tag_string = '<' + name;
            for(var key in attr) {
                tag_string += this.BLANK + key + '=' + this.double_quotes(attr[key]);
            }
            tag_string += '>';
            tag_string += ((val) ? val : '');
            tag_string += '</' + name + '>';
            return tag_string;
        }
    };
    var Fusuma = function(_target, _width, _options) {
        this.target = _target;
        this.options = _options;
        this.width = _width;
        this.current = 0;
        this.contents = $(this.target).find('ul li');
        this.browser_is = function(name) { return navigator.userAgent.indexOf(name) !== -1; };
        this.__defineGetter__('length', function(){ return this.contents.length; });
        this.__defineGetter__('last', function(){ return this.contents.length - 1; });
        this.__defineGetter__('is_start', function(){ return this.current === 0; });
        this.__defineGetter__('is_end', function(){ return this.current === this.last; });
        this.is_invalid_index = function(index) { return (index > this.last || index < 0); };
        this.apply_contents();
    };
    Fusuma.prototype.apply_contents = function() {
        this.contents = $(this.target).find('ul li');
        this.width = $(this.target).width(); 
        $(this.target).scrollLeft(this.current * this.width); 
        $(this.target).find('ul li').css('width', px(this.width));
        $(this.target).find('ul li').css('list-style', 'none');
        $(this.target).find('ul li').css('float', 'left');
        $(this.target).find('ul li').css('margin', '0px');
        $(this.target).find('ul li').css('padding', '0px');
    };
    Fusuma.prototype.add = function(content) {
        var that = this;
        var POINT = { next : that.current, prev : that.current, start : 0, end : that.last };
        var INSERT_TO = { next : 'after', prev : 'before', start : 'before', end : 'after' };
        return {
            to : function(dir) {
                $(that.contents[POINT[dir]])[INSERT_TO[dir]](Tag.generate('li', {}, content));
                if(dir === 'start' || dir === 'prev') {
                     that.current++;
                }
                that.apply_contents();
            }
        };
    };
    Fusuma.prototype.remove = function(index) {
        var dir = { next : this.current + 1, prev : this.current - 1, start : 0, end : this.last };
        var remove_index = index in dir ? dir[index] : index;
        if(this.is_invalid_index(remove_index)) return;
        if(remove_index <= this.current) this.current--;
        $($(this.target).find('ul li')[remove_index]).remove(); // todo: fix this dirty code.
        this.apply_contents();
    };
    Fusuma.prototype.go = function(dir, callback) {
        var dispatch_mapping = {
            next : 'slide_into_right', forward : 'slide_into_right', prev : 'slide_into_left', back : 'slide_into_left'
        };
        this[dispatch_mapping[dir]](callback);
    };
    Fusuma.prototype.slide_into_right = function(callback) {
        if(this.is_end) return;
        var _this = this;
        $(this.target).filter(':not(:animated)').animate({
            scrollLeft : '+=' + _this.width
        }, {
            complete : function(){ 
                _this.current++;
                if(callback) callback(); 
                if(_this.browser_is('Firefox') || _this.browser_is('Opera')) $(_this.target).scrollLeft(_this.current * _this.width);
            }
        });
    };
    Fusuma.prototype.slide_into_left = function(callback) {
        if(this.is_start) return;
        var _this = this;
        $(this.target).filter(':not(:animated)').animate({
            scrollLeft : '-=' + _this.width
        }, {
            complete : function(){
                _this.current--;
                if(callback) callback();
            }
        });
    };
    /* extend jQuery */
    var px = function(size) { return size + 'px'; };
    $.fn.fusuma = function(_width, _options) {
        var width = _width || $(this).width();
        $(this).css('width', px(width));
        $(this).find('ul').css('width', px(9999));
        $(this).find('ul').css('list-style', 'none');
        $(this).find('ul').css('margin', px(0));
        $(this).find('ul').css('padding', px(0));
        $(this).css('overflow', 'hidden');
        return new Fusuma(this, _options);
    };
})(jQuery);
