module.exports = function(io, socket, fs){

	function updateImageList(){
		images = [];
		fs.readdir('webroot/img/uploads', function (err,data) {
			if (err) { return console.log(err); }
			data = data.filter(function(v){
				return /\.png|.gif|.JPG/.test(v);
			});
			for(i=0;i<data.length;i++){
				images[i] = data[i];
			}
			socket.emit('updateImageList', images);
		});
	}
	updateImageList();

	socket.on('image-upload', function(data){
		var matches = data.dataurl.match(/^data:.+\/(.+);base64,(.*)$/);
		var buffer = new Buffer(matches[2], 'base64');

		var newPath = __dirname + "/../webroot/img/uploads/" + data.filename;
		fs.writeFile(newPath, buffer, 'base64', function (err) {
			if(err) console.log(err);
			else {
				socket.emit('upload-complete', data.filename);
				updateImageList();
			}
		});
	});

	socket.on('image-delete', function(data) {
		fs.unlink('webroot/img/uploads/'+data, function(){
			updateImageList();
		});
	});

}