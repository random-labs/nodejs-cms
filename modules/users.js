module.exports = function(io, socket, user, crypto){
	
	function updateUsersList(){
		user.find(function(error, data){
			io.sockets.emit('updateUserList', data);
		});
	}
	updateUsersList();

	socket.on('user-save', function(data){
		data.password = crypto.createHash('md5').update(data.password).digest("hex");
		var newUser = new user(data);
		newUser.save(function(){
			updateUsersList();
			socket.emit('user-id', newUser._id);
		});
	});

	socket.on('user-delete', function(data){
		user.findByIdAndRemove(data, function(){
			updateUsersList();
		});
	});

	socket.on('user-edit', function(data){
		user.findOneAndUpdate({_id: data._id},{
			$set: {
				username: data.username,
				email: data.email,
				image: data.image,
				permissions: data.permissions
			}
		}, function(){
			updateUsersList();
		});	
	});

	socket.on('user-request', function(data){
		user.findById(data, function(err, user){
			socket.emit('user-send', user);
		});
	});
}