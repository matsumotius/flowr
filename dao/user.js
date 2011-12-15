var EventEmitter = require('events').EventEmitter;
var User = require('../model/user');

var dao = module.exports = {
    save : function(query){
        var ev = new EventEmitter();
        var user = new User(query);
        user.save(function(error){
            if(!error){
                ev.emit('end', user);
            }else{
                console.log('user_dao_save:', error);
                ev.emit('error');
            }
        });
        return ev;
    },
    find : function(query, field, option){
        var ev = new EventEmitter();
        User.find(query, field, option, function(error, users){
            if(!error && users){
                ev.emit('end', users);
            }else{
                console.log('user_dao_find:', error);
                ev.emit('error');
            }
        });
        return ev; 
    },
    update : function(id, query){
	var ev = new EventEmitter();
	User.update({ _id : id }, query, function(error){
	    if(!error){
		ev.emit('end');
	    }else{
		console.log('user_dao_update:', error);
		ev.emit('error');
	    }
	});
	return ev;
    },
    remove : function(id){
        var ev = new EventEmitter();
	User.remove({ '_id' : id }, function(error){
	    if(!error){
		ev.emit('end');
	    }else{
		console.log('user_dao_remove:', error);
		ev.emit('error');
	    }
	});
        return ev;
    }
};
