module.exports = function(io, socket, content){
	function updateContentsList(){
		content.find(function(error, data){
			io.sockets.emit('updateContentsList', data);
		});
	}
	updateContentsList();

	socket.on('content-save', function (data){
		var newContent = new content(data);
		newContent.update({upsert:true});
	});

	socket.on('content-edit', function(data){
		content.findOneAndUpdate({_id: data._id},{
			$set: {
				name: data.name,
				text: data.text
			}
		}, function(){
			updateContentsList();
		});	
	});

	socket.on('content-delete', function (data){
		content.findByIdAndRemove(data, function(){
			updateContentsList();
		});
	});

	socket.on('content-request', function(data){
		content.findById(data, function(err, content){
			socket.emit('content-send', content);
		});
	});
}