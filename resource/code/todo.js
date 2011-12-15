var queue_insert = function(content_id, queue){
    return {
        next_is : function(next_id){
            for(var i=0;i<queue.length;i++) {
                if(next_id === String(queue[i].content_id)) {
                    return queue.slice(0, i).concat({ content_id : content_id }, queue.slice(i, queue.length));
                } else if(i === queue.length) {
                    return queue;
                }
            }
        },
        prev_is : function(prev_id){
            for(var i=0;i<queue.length;i++) {
                if(prev_id === String(queue[i].content_id)) {
                    return queue.slice(0, i+1).concat({ content_id : content_id }, queue.slice(i+1, queue.length));
                } else if(i === queue.length) {
                    return queue;
                }
            }
        }
    };
};

var insert = function(user_id, content_id, position) {
    var ev = new EventEmitter();
    var searching_content = content_service.find_by_id(content_id);
    searching_content.on('end', function(page) {
        var getting_queue = this.get_by_channel_id(user_id);
        getting_queue.on('end', function(queue) {
            if('next' in position) {
                var new_queue = queue_insert(content_id, queue).next_is(position['next']);
                var updating_queue = this.update_queue(user_id, new_queue);
                updationg_queue.on('end', function() { ev.emit('end') });
                updationg_queue.on('error', function() { ev.emit('error') });
            } else if('prev' in position) {
                var new_queue = queue_insert(content_id, queue).prev_is(position['prev']);
                var updating_queue = this.update_queue(user_id, new_queue);
                updationg_queue.on('end', function() { ev.emit('end') });
                updationg_queue.on('error', function() { ev.emit('error') });
            } else {
                ev.emit('error');
            }
        });
        getting_queue.on('error', function(message, code) { ev.emit('error'); });
    });
    searching_content.on('error', function() { ev.emit('error'); });
    return ev;
}

