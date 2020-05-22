$(() => {
	
	let d = $('.content');
	d.scrollTop(d.prop('scrollHeight'));

	$('#globalchat-content').height($('#page-content-wrapper').height() - $('#globalchat-header').parent().height() - 48);
	
	$('#send-msg-btn').click(function() {
		$.ajax({
			url: '/chats/globalchat/new_message',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'message': $('#message').val()}),
			success: function(data) {
				$('#content').append(`<div class="message float-right mb-2">
					<div class="green px-2 py-1">
						<div>${data.message}</div>
					</div>
				</div>`);
				$('#message').val('');
				d.scrollTop(d.prop('scrollHeight'));
			}
		});
	});
	
	$('body').delegate('.text-info', 'click', function() {
		let id = $(this).attr('data-id');
		let userId = $('#userId').val();
		$.ajax({
			url: `/chats/globalchat/user_info/${id}`,
			type: 'GET',
			success: function(data) {
				console.log(data.friends);
				$('#additional-info').html('').append($('#profile-template').clone());
				$('#additional-info').children().last().removeAttr('id').find('.card-header').find('a').attr('href', `/users/${data.user._id}/profile`);
				$('#additional-info').children().last().find('.card-header').find('img')
				.attr('src', data.user.picture || '/images/blank_profile.png').closest('.card-header').find('h5').text(data.user.name).closest('.card-header')
				.find('h6').text(`<${data.user.tag}>`).closest('.card-header').find('.friend-btn').addClass(data.friends.includes(data.user._id) ? 'btn-danger' : 'btn-success')
				.val(data.friends.includes(data.user._id) ? 'unfriend' : 'friend').text(data.friends.includes(data.user._id) ? 'Unfriend' : 'Friend').closest('.card-header')
				.find('.userInfoId').val(data.user._id);
				if(data.convo) {
					$('#additional-info').children().last().find('.card-body').append($('#convo-template').clone());
					let content = $('#additional-info').children().last().find('.card-body').find('.content');
					content.closest('#convo-template').removeAttr('id');
					content.attr('id', 'content2');
					content.parent().find('#message3').attr('id', 'message2').parent().find('#send-msg-btn3').attr('id', 'send-msg-btn2');
					$('#convo-id').val(data.convo._id);
					data.convo.messages.forEach(function(message) {
						if(message.special) {
							console.log(message.message);
							content.append(`<div class="w-75 mx-auto text-center text-danger" style="clear:both">
												${message.message}
											</div>`);
							return;
						}
						if(message.writer === userId) {
							content.append(`<div class="message float-right mb-2">
										<div class="green px-2 py-1">
											<div>${message.message}</div>
										</div>
									</div>`);
						} else {
							content.append(`<div class="float-left message mb-2">
										<div class="gray px-2 py-1">
											<div>${message.message}</div>
										</div>
									</div>`);
						}
					});
					content.scrollTop(content.prop('scrollHeight'));
				} else {
					$('#convo-id').val('none');
					$('#additional-info').children().last().find('.card-body').append(`<button type="button" class="btn btn-success create-convo">Start Conversation</button>`);
				}
			}
		});
	}).delegate('.friend-btn', 'click', function() {
		let btn = $(this);
		let userInfoId = $(this).closest('.card-header').find('.userInfoId').val();
		if($(this).val() === 'friend') {
			$.ajax({
				url: `/users/${userInfoId}/add_friend`,
				type: 'POST',
				success: function(data) {
					btn.val('unfriend').removeClass('btn-success').addClass('btn-danger').text('Unfriend');
				}
			});
		} else {
			$.ajax({
				url: `/users/${userInfoId}/remove_friend`,
				type: 'POST',
				success: function(data) {
					btn.val('friend').removeClass('btn-danger').addClass('btn-success').text('Friend');
				}
			});
		}
	}).delegate('.create-convo', 'click', function() {
		$(this).after($('#new-convo'));
		$(this).remove();
	}).delegate('#send-msg-btn2', 'click', function() {
		console.log($('#message2').val());
		$.ajax({
			url: `/chats/conversations/${$('#convo-id').val()}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'message': $('#message2').val()}),
			success: function(data) {
				$('#content2').append(`<div class="message float-right mb-2">
					<div class="green px-2 py-1">
						<div>${data}</div>
					</div>
				</div>`);
				$('#message2').val('');
				$('#content2').scrollTop($('#content2').prop('scrollHeight'));
			}
		});
	});
	
	$('#new-convo-btn').click(function() {
		let userInfoId = $(this).closest('.card').find('.userInfoId').val();
		$.ajax({
			url: '/chats/conversations/new',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'convo_user': userInfoId, 'name': $('#new-convo-name').val(), 'globalchat': 'yes'}),
			success: function(data) {
				$('#convo-id').val(data.id);
				$('#additional-info').children().last().find('.card-body').append($('#convo-template').clone());
				let content = $('#additional-info').children().last().find('.card-body').find('.content');
				content.closest('#convo-template').removeAttr('id');
				content.parent().find('#message3').attr('id', 'message2').parent().find('#send-msg-btn3').attr('id', 'send-msg-btn2');
				content.append(`<div class="w-75 mx-auto text-center text-danger" style="clear:both">
												${data.message}
											</div>`);
				$('#new-convo-holder').append($('#new-convo'));
			}
		});
	});
	
	setTimeout(checkForMessages, 2000);
	setTimeout(checkForChatMessages, 5000);
});

function checkEnter(e) {
	if(e.keyCode == 13) {
		$('#send-msg-btn').trigger('click');
	}
}

function checkEnter2(e) {
	if(e.keyCode == 13) {
		$('#send-msg-btn2').trigger('click');
	}
}

function checkForMessages() {
	let d = $('#content');
	$.ajax({
		url: `/chats/globalchat/get_messages`,
		type: 'GET',
		success: function(data) {
			console.log(data);
			if(Array.isArray(data)) {
				data.forEach(function(message) {
					$('#content').append(`<div class="float-left message mb-2">
						<small>
							<a href="#additional-info" data-id=${message.id} class="text-info">&lt;${message.tag}&gt;</a>
						</small>
						<div class="gray px-2 py-1">
							<div>${message.msg}</div>
						</div>
					</div>`)
				});
				d.scrollTop(d.prop('scrollHeight'));
			} else {
				console.log(data);
			}
		},
		complete: function(data) {
			setTimeout(checkForMessages, 5000);
		}
	});
}

function checkForChatMessages() {
	let chatId = $('#convo-id').val();
	let content = $('#additional-info').children().last().find('.card-body').find('.content');
	if(chatId === 'none') {
		console.log('returning...');
		setTimeout(checkForChatMessages, 5000);
		return;
	}
	$.ajax({
		url: `/chats/conversations/${chatId}/get_messages`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({'id': $('#userId').val()}),
		success: function(data) {
			if(Array.isArray(data)) {
				data.forEach(function(message) {
					content.append(`<div class="float-left message mb-2">
						<div class="gray px-2 py-1">
							<div>${message.msg}</div>
						</div>
					</div>`)
				});
				if(data.length > 0) {
					content.scrollTop(content.prop('scrollHeight'));
				}
			} else {
				console.log(data);
			}
		},
		complete: function(data) {
			setTimeout(checkForChatMessages, 5000);
		}
	});
}