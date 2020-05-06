$(() => {
	
	var d = $('.content');
	d.scrollTop(d.prop('scrollHeight'));
	
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
});

function calcCreateFormHeights() {
	var height = $('#create_form').closest('.h-100').height();
	$('#create_form').children('.make-25').height(height/4);
	$('#create_form').children('.make-55').height(.55 * height);
	$('.friend-pic-div').height($('.friend-pic-div').width());
}	