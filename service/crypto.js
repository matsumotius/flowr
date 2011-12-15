var crypto = require('crypto');
var service = module.exports = {
    hash : function(value){
        return crypto.createHash('md5').update(value).digest('hex');
    }
};
