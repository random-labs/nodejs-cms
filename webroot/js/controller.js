
//////////////////
// Blog Entries
//////////////////

var socket = io.connect(window.location.protocol +'//'+ window.location.host);

function BlogListCtrl($scope, $http) {
	socket.on('updatePosts', function(data){
		$scope.posts = data;
		$scope.$apply();
	});
}

function UserListCtrl($scope, $http) {
	socket.on('updateUserList', function(data){
		$scope.users = data;
		$scope.$apply();
	});
}

function ImageListCtrl($scope, $http) {
	socket.on('updateImageList', function(data){
		$scope.images = data;
		$scope.$apply();
	});
}

function ContentListCtrl($scope, $http) {
	socket.on('updateContentsList', function(data){
		$scope.contents = data;
		$scope.$apply();
	});
}

//////////
// Login
//////////
$('document').ready(function(){
	$('#loginForm').on('submit', function(){
		var userData = {
			username: $("#username").val(),
			password: $("#password").val()
		}
		
		$.ajax({
			type: "POST",
			url: "/loginCheck",
			data: userData
		}).done(function(res){
			if(res.login === true){
				window.location.replace("/admin");
			} else {
				$('#loginForm').addClass('shake');
				$('#submit').addClass('fail').val('Login Failed');
				setTimeout( function(){ $('#loginForm').removeClass('shake');}, 800)
				setTimeout( function(){ $('#submit').removeClass('fail').val('Login'); },3000)
			}
		});
		return false;
	});
});
