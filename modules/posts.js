module.exports = function(io, socket, post){

	function updatePosts(){
		post.find(function(error, data){
			data.sort(function(a,b){
				a = new Date(a.date);
				b = new Date(b.date);
				return a<b?-1:a>b?1:0;
			});
			data.reverse();
			io.sockets.emit('updatePosts', data);
		});
	};
	updatePosts();

	socket.on('post-save', function(data){
		var newPost = new post(data);
		newPost.save(function(){
			updatePosts();
			socket.emit('post-id', newPost._id);
		});
	});

	socket.on('post-delete', function(data){
		post.findByIdAndRemove(data, function(){
			updatePosts();
		})
	});

	socket.on('post-edit', function(data){
		post.findOneAndUpdate({_id: data._id},{
			$set: {
				heading: data.heading,
				body: data.body
			}
		}, function(){
			updatePosts();
		});	
	});

	socket.on('post-request', function(data){
		post.findById(data, function(err, post){
			socket.emit('post-send', post);
		});
	});

}