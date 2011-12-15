var parse = function(key, obj){ return key in obj ? obj[key] : null };
var Response = function(params){
    this.is_success = false;
    this.params = params;
    this.data    = parse('data',    this.params);
    this.message = parse('message', this.params);
    this.__defineGetter__('json', function(){ return JSON.stringify(this.hash); });
    this.__defineGetter__('hash', function(){
        return { is_success : this.is_success, data : this.data, message : this.message };
    });
    return this;
};
Response.prototype.success = function(){
    this.is_success = true;
    return this;
};
Response.prototype.error = function(){
    this.is_success = false;
    return this;
};
module.exports = {
    success : function(params){
        return new Response(params).success();
    },
    error : function(params){
        return new Response(params).error();
    }
};

