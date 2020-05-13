$(() => {
	
	let d = $('.content');
	d.scrollTop(d.prop('scrollHeight'));
	
	//console.log($('.user-pic-div').width());
	$('.user-pic-div').height($('.user-pic-div').width());
	
	$('#create-convo-btn').click(function() {
		$('#create_form').toggleClass('d-none');
		$('.message-box').toggleClass('d-none');
		calcCreateFormHeights();
	});
	
	$.ajax({
		url: '/chats/conversations/notifications',
		type: 'POST',
		success: function(data) {
			data.forEach(function(convo) {
				$('#convo-list').children().each(function() {
					if($(this).find('input').val() == convo.id && convo.num != 0) {
						$(this).find('.badge').text(convo.num);
					}
				});
			});
		}
	});
	
	$('.delete-convo-select').click(function() {
		if($(this).find('input').prop('checked') == true) {
			$(this).find('input').prop('checked',false)
			$(this).removeClass('border-danger').addClass('border-primary').find('.col-2 span').removeClass('text-danger').addClass('text-dark');
		} else {
			$(this).find('input').prop('checked',true)
			$(this).removeClass('border-primary').addClass('border-danger').find('.col-2 span').removeClass('text-dark').addClass('text-danger');
		}
		//console.log($(this).find('input'));
	});
	
	$('.create-convo-user').click(function() {
		if($(this).find('input').prop('checked') == true) {
			$(this).find('input').prop('checked', false);
			$(this).removeClass('border-success').addClass('border-light');
		} else {
			$(this).find('input').prop('checked', true);
			$(this).removeClass('border-light').addClass('border-success');
		}
	});
	
	$('.delete-convo-user').click(function() {
		if($(this).find('input').prop('checked') == true) {
			$(this).find('input').prop('checked', false);
			$(this).removeClass('border-danger').addClass('border-light');
		} else {
			$(this).find('input').prop('checked', true);
			$(this).removeClass('border-light').addClass('border-danger');
		}
	});
	
	$('#form-message').submit(function(e) {
		e.preventDefault();
		$.ajax({
			url: '',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'message': $(this).find('#message').val()}),
			success: function(data) {
				$('.content').append(`<div class="message float-right mb-2">
					<div class="green px-2 py-1">
						<div>${data}</div>
					</div>
				</div>`);
				$('#message').val('');
				d.scrollTop(d.prop('scrollHeight'));
			}
		});
	});
	
	setTimeout(checkSideBar, 10000);
	
	if($('#current-convo-id').length != 0) {
		setTimeout(checkForMessages, 5000);
	}
});

function calcCreateFormHeights() {
	let height = $('#create_form').closest('.h-100').height();
	$('#create_form').children('.make-25').height(height/4);
	$('#create_form').children('.make-55').height(.55 * height);
	$('.friend-pic-div').height($('.friend-pic-div').width());
}	

function checkForMessages() {
	let d = $('.content');
	let id = $('#current-convo-id').val();
	$.ajax({
		url: `/chats/conversations/${id}/get_messages`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({'id': $('#user-id').val()}),
		success: function(data) {
			if(Array.isArray(data)) {
				data.forEach(function(message) {
					$('.content').append(`<div class="float-left message mb-2">
						<small>
							<a href="/users/${message.id}/profile" class="text-info">&lt;${message.tag}&gt;</a>
						</small>
						<div class="gray px-2 py-1">
							<div>${message.msg}</div>
						</div>
					</div>`)
				});
				if(data.length > 0) {
					d.scrollTop(d.prop('scrollHeight'));
				}
			} else {
				console.log(data);
			}
		},
		complete: function(data) {
			setTimeout(checkForMessages, 5000);
		}
	});
}

function checkSideBar() {
	let id = $('#current-convo-id').val() || '';
	$.ajax({
		url: `/chats/conversations/sidebar`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({'id': $('#user-id').val()}),
		success: function(data) {
			$('#convo-list').html('');
			console.log('here we are');
			data.forEach(function(convo) {
				let names = [];
				convo.users.forEach(function(user) {
					names.push(user.name);
				});
				names = names.join(', ');
				$('#convo-list').append(`<a href="/chats/conversations/${convo.id}" class="list-group-item list-group-item-action pb-0 border-primary ${convo.id == id ? 'active' : ''}">
					<h4 class="mb-0">${convo.name} <span class="badge badge-info">${convo.new_len > 0 && convo.id != id ? convo.new_len : ''}</span></h4>
					<p class="mb-0 convo_users_label">
						${names}
					</p>
					<input type="hidden" id="convo-id" value="${convo.id}">
				</a>`);
			});
		},
		complete: function(data) {
			setTimeout(checkSideBar, 10000);
		}
	});
}

function checkEnter(e) {
	if(e.keyCode == 13) {
		$('#send-msg-btn').trigger('click');
	}
}