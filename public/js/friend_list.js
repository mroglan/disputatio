
$(() => {
	
	$('body').delegate('.card button', 'click', function() {
		let id = $(this).closest('.card').find('input').val();
		$.ajax({
			url: `/users/${id}/remove_friend`,
			type: 'POST',
			success: function(data) {
				if(Array.isArray(data)) {
					console.log('here');
				} else {
					console.log(data);
				}
			}
		});
		$(this).closest('.card').parent().remove();
	}).delegate('.card-body h3', 'click', function() {
		let id = $(this).closest('.card').find('input').val();
		window.location = `/users/${id}/profile`;
	});
});