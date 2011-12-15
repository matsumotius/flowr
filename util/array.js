var array_util = module.exports = {
    find_key_set : function(key, value) {
        return {
            from : function(hash_array) {
                for(var i=0;i<hash_array.length;i++) {
                    if(hash_array[i][key] == value) return i;
                    else if(i==hash_array.length-1) return -1;
                }
            }
        }
    }
};
