$(document).ready(function() {

	var socket = io.connect(window.location.protocol +'//'+ window.location.host);
	var markdown = new Showdown.converter();

	// View full blog post
	$('#postList').on('click', 'h3', function(){
		var dataId = $(this).data('id');
		socket.emit('post-request', dataId)
		window.history.pushState('post', 'post', '/post/'+dataId);
	});

	// Receive and render full blog post
	socket.on('post-send', function(data){ 
		var post = '<h2>'+data.heading+'</h2> <p class="post-date">Posted: '+data.date.substring(0,10)+'</p> <div class="post-body">'+ markdown.makeHtml(data.body)+'</div>';
		$('#post').html(post);
		//$('#container').css('height', $('#post').height());
		$('#content').css('margin-left','-150%');
		$('#post').css({'margin-left':'0'});
	});

	// Render content based on url or history back/forward
	window.onpopstate = function(event){
		url = window.location.pathname.split('/');
		if(url[1]==''){
			$('#content').css('margin-left','0');
			$('#post').css({'margin-left':'150%'});
			setTimeout(function(){$('#post').html('')},600);
		} else if(url[1]=='post'){
			socket.emit('post-request', url[2])
			$('#content').css({'transition':'none','margin-left':'-150%'});
			$('#post').css({'transition':'none','margin-left':'0'});
			setTimeout(function(){
				$('#content').css({'transition':'0.7s all'});
				$('#post').css({'transition':'0.7s all'});
			})
		}
	}

	// Render list of blog posts on front page
	socket.on('updatePosts', function(data){
		var postList="";
		for(var i=0; i<data.length; i++){
			postList += '<div class="postItem"><h3 data-id="'+data[i]._id+'">'+ data[i].heading + '</h3> <div class="date">'+ data[i].date.substring(0,10) +'</div></div>';
		}
		$('#content #postList').html(postList);
	});

});