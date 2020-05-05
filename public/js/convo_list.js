$(() => {
	
	var d = $('.content');
	d.scrollTop(d.prop('scrollHeight'));
	
	$('#create-convo-btn').click(function() {
		$('#create_form').toggleClass('d-none');
		$('.message-box').toggleClass('d-none');
	});
});