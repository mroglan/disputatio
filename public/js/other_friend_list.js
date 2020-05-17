$(() => {
	
	$('.friend_pic_div').each(function() {
		$(this).height($(this).width());
	});
	
	$('.card-footer button').click(function() {
		//console.log($(this).val());
		let id = $(this).closest('.card').find('input').val();
		let button = $(this);
		if($(this).val() == 'unfriend') {
			$.ajax({
				url: `/users/${id}/remove_friend`,
				type: 'POST',
				success: function(data) {
					console.log('success');
					if(Array.isArray(data)) {
						button.val('friend').text('Add friend').removeClass('btn-success').addClass('btn-primary');
					}
				}
			});
		} else {
			$.ajax({
				url: `/users/${id}/add_friend`,
				type: 'POST',
				success: function(data) {
					console.log('success');
					if(Array.isArray(data)) {
						button.val('unfriend').text('Friended').removeClass('btn-primary').addClass('btn-success');
					}
				}
			});
		}
	});
});