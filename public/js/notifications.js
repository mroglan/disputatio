$(() => {
	
	$.ajax({
		url: '/chats/side_notifications/convos',
		type: 'POST',
		success: function(data) {
			//console.log(data);
			if(data != '0') {
				$('#side-convos .badge').text(data);
			}
		}
	});
	
});