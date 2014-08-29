///////////////////
// Module dependencies
///////////////////

	var express = require('express'),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io').listen(server),
		fs = require('fs'),
		crypto = require('crypto');

	app.configure(function(){
		io.set('log level', 1); //disables socket.io debug mode
		app.set('views', __dirname + '/views')
		app.set('view engine', 'jade')
		app.use(express.cookieParser()) // enable setting cookies with express
		app.use(express.bodyParser()) // enable parsing for post requests
		app.use(express.static(__dirname + '/webroot'))
		app.use(app.router) //enable express routes
	});

	server.listen(3000, function(){
		console.log("listening on localhost:3000")
	});

///////////////////
// Mongoose Connection
///////////////////

	mongoose = require('mongoose');
	//Connecting to MongoDB
	//mongoose.connect('mongodb://nodejitsu:08f9265488f28bd1d2e9fdba9d224d8c@linus.mongohq.com:10053/nodejitsudb9594096359');
	mongoose.connect('mongodb://localhost/test');

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
		console.log('Connected to test db');
	});

///////////////////
// Mongoose models
///////////////////

	var userSchema = mongoose.Schema({
		username: String,
		password: String,
		email: String,
		image: String,
		permissions: String
	});
	var user = mongoose.model('user', userSchema);

	var postsSchema = mongoose.Schema({
		heading: String,
		body: String,
		date: String
	});
	var post = mongoose.model('post', postsSchema);

	var contentSchema = mongoose.Schema({
		name: String,
		text: String
	});
	var content = mongoose.model('content', contentSchema);

///////////////////
// Routes
///////////////////

	var routes = require('./modules/routes.js');
	routes(app, crypto, user, content);

///////////////////
// Sockets
///////////////////

io.sockets.on('connection', function(socket) {

	//Posts
	var posts = require('./modules/posts.js');
	posts(io, socket, post);

	//Image
	var images = require('./modules/images.js');
	images(io, socket, fs);

	//Users
	var users = require('./modules/users.js');
	users(io, socket, user, crypto);

	//content
	var contents = require('./modules/contents.js');
	contents(io, socket, content);

});

