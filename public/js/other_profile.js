
$(() => {
	
	$('#profile-pic-div').height($('#profile-pic-div').width());
	
	let id = $('#profile-id').val();
	/*
	console.log('hello');
	$.ajax({
		url: `/users/${id}/profile/friendinfo`,
		type: 'POST',
		success: function(data) {
			//console.log('success');
			$('#friended_num').append(data + ' friended');
		}
	});
	*/
	
	$('.friend-button').click(function() {
		if($(this).val() == 'unfriend') {
			$.ajax({
				url: `/users/${id}/remove_friend`,
				type: 'POST',
				success: function(data) {
					if(Array.isArray(data)) {
						$('.friend-button').val('friend').text('Friend').removeClass('btn-danger').addClass('btn-success');
						var num = parseInt($('#friends_num').text().substring(0, 1)) - 1;
						$('#friends_num').text(num + ' friends');
					}
				}
			});
		} else {
			$.ajax({
				url: `/users/${id}/add_friend`,
				type: 'POST',
				success: function(data) {
					if(Array.isArray(data)) {
						$('.friend-button').val('unfriend').text('Unfriend').removeClass('btn-success').addClass('btn-danger');
						var num = parseInt($('#friends_num').text().substring(0, 1)) + 1;
						$('#friends_num').text(num + ' friends');
					}
				}
			});
		}
	});
	
});