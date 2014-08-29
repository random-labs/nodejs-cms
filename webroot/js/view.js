$('document').ready(function(){

	var socket = io.connect(window.location.protocol +'//'+ window.location.host);

	var $el = {
		'blogTable': $('#blogTable'),
		'content_name': $('#content-name'),
		'content_text': $('#content-text'),
		'content_submit': $('#content-submit'),
		'content_table': $('#contentTable'),
		'editor': $('#editor'),
		'imagesGrid': $('#imagesGrid'),
		'imagePopup': $('#imagePopup'),
		'nav': $('nav'),
		'popup': $('#popup'),
		'popup_image': $('#popup-image'),
		'popup_filename': $('#popup-filename'),
		'popup_markdown': $('#popup-markdown'),
		'popup_delete': $('#popup-delete'),
		'postContent': $('#postContent'),
		'postHeading': $('#postHeading'),
		'savePost': $('#savePost'),
		'submitUser': $('#submitUser'),
		'tabs': $('.tabs'),
		'tab_file': $('.tab-file'),
		'userEditor': $('#userEditor'),
		'usersTable': $('#usersTable'),
		'window': $('.window'),
		'window_confirm': $('#window-confirm'),
		'window_cancel': $('#window-cancel')
	}

	// Tabs
		$el.tabs.find('.tab-inactive, .tab').on('click', function(){
			$el.tabs.find('.tab').removeClass('tab').addClass('tab-inactive');
			$(this).removeClass('tab-inactive').addClass('tab');

			$('#content > div').css('display','none');
			$($(this).attr('data-id')).css('display','block');
		});

		$el.tabs.find('.clear').on('click', function(){
			$($(this).attr('data-id')).attr('data-id','');
			$($(this).attr('data-id')).find('input,textarea').val('');
		});

	// Nav active 
		var pagename = window.location.pathname.split('/')[2];
		$('.'+pagename).parent().addClass('active');

		$el.nav.on('mouseenter', function(){
			$(this).find('.active').removeClass('active')
		});
		$el.nav.on('mouseleave', function(){
			$('.'+pagename).parent().addClass('active');
		});

	//Custom Alert
		function userAlert(callback){
			$el.popup.fadeIn();
			$el.window.css('transform','scale(1)');
			$el.window_confirm.on('click', function(){
				$el.window_confirm.off();
				$el.window_cancel.off();
				$el.popup.fadeOut();
				$el.window.css('transform','scale(0)')
				callback(true);
			});
			$el.window_cancel.on('click', function(){
				$el.window_confirm.off();
				$el.window_cancel.off();
				$el.popup.fadeOut();
				$el.window.css('transform','scale(0)')
				callback(false);
			});
		}
	
	/////////////////
	// Post actions
	/////////////////

		// Save Post
			$el.savePost.on('click', function(){
				if($el.editor.attr('data-id')!==''){
					//If new post has id, edit current post
					var data = {
						_id: $el.editor.attr('data-id'),
						heading: $el.postHeading.val(),
						body: $el.postContent.val(),
					}
					socket.emit('post-edit',data);
				} else {
					//else save new post
					var data = {
						heading: $el.postHeading.val(),
						body: $el.postContent.val(),
						date: new Date()
					}
					socket.emit('post-save',data);
				}
				$el.savePost.addClass('button-saved').html('Saved');
				setTimeout(function(){ $el.savePost.removeClass('button-saved').html('Save User') }, 1500);
			});
			socket.on('post-id', function(data){
				$el.editor.attr('data-id', data);
			});

		// Delete Post
			$el.blogTable.on('click', '.button-delete', function(){
				var thisId = $(this).parent().parent().attr("data-id");
				userAlert(function(res){
					if(res==true){
						socket.emit('post-delete', thisId);
					}
				});
			});

		// Edit Post
			$el.blogTable.on('click', '.button-edit', function(){

				var thisId = $(this).parent().parent().attr("data-id");
				socket.emit('post-request', thisId);

				socket.on('post-send', function(data){
					$el.postHeading.val(data.heading)
					$el.postContent.val(data.body)
				
					//state management
					$el.tabs.find('.tab').removeClass('tab').addClass('tab-inactive');
					$('#content > div').css('display','none');
					$el.editor.attr('data-id',data._id);
					$el.editor.css('display','block');
				});
			});

	/////////////////
	// User actions
	/////////////////

		// New Users
			$el.submitUser.on('click', function(){
				var data = {
					username: $('#user_username').val(),
					password: $('#user_password').val(),
					email: $('#user_email').val(),
					permissions: $('#user_permissions option:selected').val(),
					image: $('#user_image').val()
				}

				if($el.userEditor.attr('data-id')!==''){
					data._id = $el.userEditor.attr('data-id');
					socket.emit('user-edit',data);
				} else {
					socket.emit('user-save',data);
				}
				$el.submitUser.addClass('button-saved').html('Saved');
				setTimeout(function(){ $el.submitUser.removeClass('button-saved').html('Save User') }, 1500);
			});
			socket.on('user-id', function(data){
				$el.userEditor.attr('data-id',data);
			})

		// Delete Post
			$el.usersTable.on('click', '.button-delete', function(){
				var thisId = $(this).parent().parent().attr("data-id");
				userAlert(function(res){
					if(res==true){
						socket.emit('user-delete', thisId);
					}
				});
			});

		// Edit User
			$el.usersTable.on('click', '.button-edit', function(){

				var thisId = $(this).parent().parent().attr("data-id");
				socket.emit('user-request', thisId);

				socket.on('user-send', function(data){
					$('#user_username').val(data.username),
					$('#user_password').css('display','none').prev('label').css('display','none').prev('br').css('display','none'),
					$('#user_email').val(data.email),
					$('#user_permissions option[value='+data.permissions+']').prop('selected', true),
					$('#user_image').val(data.image)
				
					//state management
					$el.tabs.find('.tab').removeClass('tab').addClass('tab-inactive');
					$('#content > div').css('display','none');
					$el.userEditor.attr('data-id',data._id);
					$el.userEditor.css('display','block');
				});
			});

		$el.tabs.find("div[data-id='#userEditor']").on('click', function(){
			$('#user_password').css('display','inline').prev('label').css('display','inline').prev('br').css('display','block');
		});

	///////////////////
	// Image actions
	///////////////////

		//Open Image Popup
			$el.imagesGrid.on('click', '.image-item', function(){
				var filename = $(this).find('.image-name').html(); //.css('outline','1px solid #f00')
				$el.imagePopup.fadeIn();
				$el.popup_filename.html(filename);
				$el.popup_markdown.html('!['+filename.replace('.png','')+'](/img/uploads/'+filename+')');
				$el.popup_image.attr('src','/img/uploads/'+filename);
			});

		// Close Image Popup
			$el.imagePopup.on('click', function(){
				$(this).fadeOut();
			}).children().click(function(e) {
				return false;
			});;

		// Delete Image
			$el.popup_delete.on('click', function(){
				userAlert(function(res){
					if(res==true){
						var filename = $el.popup_filename.html();
						socket.emit('image-delete', filename);
						$el.imagePopup.fadeOut();
					}
				});	
			})

		// Upload Image
			$el.tab_file.find('#input-file').on('change', function(e){
				$('#loadingGif').css('display','block');
				var file = e.originalEvent.target.files[0],
					reader = new FileReader(),
					filename = $(this).val().replace(/C:\\fakepath\\/i, '');
					
				reader.onload = function(evt){
					socket.emit('image-upload', {dataurl: evt.target.result, filename: filename});
				}
				reader.readAsDataURL(file);
			});

			socket.on('upload-complete', function(){
				$('#loadingGif').css('display','none');
			});


	///////////////////
	// Content actions
	///////////////////
		$el.content_submit.on('click', function(){
			var data = {
				name: $el.content_name.val(),
				text: $el.content_text.val()
			}
			if($el.editor.attr('data-id')!==''){
				data._id = $el.editor.attr('data-id');
				socket.emit('content-edit',data);
			} else {
				socket.emit('content-save',data);
			}
			$el.content_submit.addClass('button-saved').html('Saved');
			setTimeout(function(){ $el.content_submit.removeClass('button-saved').html('Save Content') }, 1500);
		});

		$el.content_table.on('click', '.button-delete', function(){
			var thisId = $(this).parent().parent().attr("data-id");
			userAlert(function(res){
				if(res==true){
					socket.emit('content-delete', thisId);
				}
			});
		});

		$el.content_table.on('click', '.button-edit', function(){
			var thisId = $(this).parent().parent().attr("data-id");
			socket.emit('content-request', thisId);

			socket.on('content-send', function(data){
				$el.content_name.val(data.name);
				$el.content_text.val(data.text);
			
				//state management
				$el.tabs.find('.tab').removeClass('tab').addClass('tab-inactive');
				$('#content > div').css('display','none');
				$el.editor.attr('data-id',data._id);
				$el.editor.css('display','block');
			});
		});

});