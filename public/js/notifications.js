$(() => {
	
	conversationNotifications();
	groupNotifications();
});

function conversationNotifications() {
	$.ajax({
		url: '/chats/side_notifications/convos',
		type: 'POST',
		success: function(data) {
			//console.log(data);
			if(data != '0') {
				$('#side-convos .badge').text(data);
			}
		},
		complete: function(data) {
			setTimeout(conversationNotifications, 5000);
		}
	});
}

function groupNotifications() {
	$.ajax({
		url: '/chats/side_notifications/groups',
		type: 'POST',
		success: function(data) {
			if(data != '0') {
				$('#side-groups .badge').text(data);
			}
		},
		complete: function(data) {
			setTimeout(groupNotifications, 5000);
		}
	});
}