$(() => {
	if($('#status').val() === 'invite_only' || $('#status').val() === 'closed') {
		$('#closed-code').removeClass('d-none');
	}
	
	$('#status').change(function() {
		if($('#status').val() === 'invite_only' || $('#status').val() === 'closed') {
			$('#closed-code').removeClass('d-none');
		} else {
			$('#closed-code').addClass('d-none');
		}
	});
	
	$('#pic-btn').click(function() {
		$('#pic-file').trigger('click');
	});
	
	$('#pic-file').change(function() {
		let formdata = new FormData();
		if($(this).prop('files').length > 0) {
			console.log('has files');
			let file = $(this).prop('files')[0];
			formdata.append('image', file);
			$.ajax({
				url: '/chats/groups/new_picture',
				type: 'POST',
				data: formdata,
				processData: false,
				contentType: false,
				success: function(data) {
					$('#picture_path').val(data);
					$('#group-pic-preview').height($('#group-pic-preview').width()).find('img').attr('src', data);
				}
			});
		}
	});
});