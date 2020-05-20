$(() => {
	
	$('.accept-invite-btn').click(function() {
		let group = $(this).parent().find('.inviteGroupId').val();
		let invite = $(this).parent().find('.inviteId').val();
		$.ajax({
			url: '/chats/groups/accept_invite',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'group': group, 'inviteId': invite}),
			success: function(data) {
				window.location.reload(true);
			}
		});
	});
	
	$('.decline-invite-btn').click(function() {
		let invite = $(this).parent().find('.inviteId').val();
		$.ajax({
			url: '/chats/groups/decline_invite',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'inviteId': invite}),
			success: function(data) {
				window.location.reload(true);
			}
		});
	});
	
});