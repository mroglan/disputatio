$(() => {
	
	$('.profile-pic-div').each(function() {
		$(this).height($(this).width());
	});
	
	$('.full-height').height($('#page-content-wrapper').height() - $('#groups-title').parent().height());
	
	$('[data-toggle="tooltip"]').tooltip();
	
	$('#create-group-btn').click(function() {
		$('#create-group-div').toggleClass('d-none');
		$('#all-posts').toggleClass('d-none');
	});
	
	$('#pic-btn').click(function(e) {
		e.preventDefault();
		$('[data-toggle="tooltip"]').tooltip('hide');
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