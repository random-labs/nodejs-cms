module.exports = function(app, crypto, user, content){

	app.get('/', function (req, res) {
		// Get text elements data
		content.find(function(error, data){
			var newData = new Object();
			for(var i=0;i<data.length;i++){
				newData[data[i].name] = data[i].text;
			}
			res.render('index', { username : req.cookies.name, content: newData});
		});
	});

	app.get('/logout', function (req, res) {
		res.clearCookie('name');
		res.clearCookie('_id');
		res.redirect('/');
	});

	app.get('/login', function (req, res){
		res.render('login');
	});

	app.get('/admin', function (req, res){
		user.findOne({ '_id': req.cookies._id }, function (err, user) {
			if(!user) res.redirect("/login")
			else res.render("admin/admin", {username: req.cookies.name})
		});
	});

	app.get('/admin/:page', function (req, res){
		user.findOne({ '_id': req.cookies._id }, function (err, user) {
			if(!user) res.redirect("/login")
			else{ 
				res.render("admin/"+req.params.page, {username: req.cookies.name}, function(err, html){
					if(err) res.send('Page Not Found', 404);
					else res.end(html);
				});
			}
		});
	});

	app.get('/post/:postId', function (req, res) { 
		res.render('index');
	});

	app.post('/loginCheck', function (req, res) {
		var password = req.body.password;
		var hash = crypto.createHash('md5').update(password).digest("hex");
		user.findOne({ 'username': req.body.username }, function (err, user) {
			if (!user) {
				res.send({ login: false });
			} else if(user.password == hash){
				res.cookie('name', user.username, { expires: new Date(Date.now() + 99999999999999), httpOnly: true});
				res.cookie('_id', user._id, { expires: new Date(Date.now() + 99999999999999), httpOnly: true});
				res.send({ login: true });
			} else {
				res.send({ login: false });
			}
		});
	});

	app.get('*', function(req, res){
		res.send('Page Not Found', 404);
	});
}