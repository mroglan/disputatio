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
				$('.content').append(`<div class="message float-right mb-2">
					<div class="green px-2 py-1">
						<div>${data.message}</div>
					</div>
				</div>`);
				$('#message').val('');
				if( d.scrollTop === (d.scrollHeight - d.offsetHeight)) {
					d.scrollTop(d.prop('scrollHeight'));
				}
			}
		});
	});
	
	setTimeout(checkForMessages, 2000);
});

function checkEnter(e) {
	if(e.keyCode == 13) {
		$('#send-msg-btn').trigger('click');
	}
}

function checkForMessages() {
	let d = $('.content');
	$.ajax({
		url: `/chats/globalchat/get_messages`,
		type: 'GET',
		success: function(data) {
			if(Array.isArray(data)) {
				data.forEach(function(message) {
					$('.content').append(`<div class="float-left message mb-2">
						<small>
							<a href="#additional-info" data-id="<%= message.id %>" class="text-info">&lt;${message.tag}&gt;</a>
						</small>
						<div class="gray px-2 py-1">
							<div>${message.msg}</div>
						</div>
					</div>`)
				});
				if(data.length > 0 && d.scrollTop === (d.scrollHeight - d.offsetHeight)) {
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