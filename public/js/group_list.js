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
	
	$('#new-post-btn').click(function() {
		$('#new-post-div').toggleClass('d-none');
	});
	
	$('#toggle-sidebar').click(function() {
		$('#right-sidebar').toggleClass('d-none');
		$(this).children().toggleClass('d-none');
	});
	
	$('#file-upload-btn').click(function() {
		$('#file-upload').trigger('click');
	});
	
	$('#file-upload').change(function() {
		let formdata = new FormData();
		if($(this).prop('files').length > 0) {
			console.log('has files');
			let file = $(this).prop('files')[0];
			formdata.append('upFile', file);
			
			$.ajax({
				url: '/chats/groups/new_post/file_upload',
				type: 'POST',
				data: formdata,
				processData: false,
				contentType: false,
				success: function(data) {
					console.log('success');
					$('#file-upload-list').append($('#file-upload-item-template').clone());
					$('#file-upload-list').children().last().removeAttr('id').removeClass('hidden').find('.filename').text(data.name).attr('href', `${data.path}`)
					.closest('.list-group-item').find('input').attr('name', 'file_upload').val(data.path);
				}
			});
		}
	});
	
	$('#image-upload-btn').click(function() {
		$('#image-upload').trigger('click');
	});
	
	$('#image-upload').change(function() {
		let formdata = new FormData();
		if($(this).prop('files').length > 0) {
			console.log('has files');
			let file = $(this).prop('files')[0];
			formdata.append('image', file);
			
			$.ajax({
				url: '/chats/groups/new_post/image_upload',
				type: 'POST',
				data: formdata,
				processData: false,
				contentType: false,
				success: function(data) {
					console.log('success');
					$('#image-upload-container').append($('#image-upload-template').clone());
					$('#image-upload-container').children().last().removeAttr('id').removeClass('hidden').find('img').attr('src', data).parent()
					.find('input').attr('name', 'image_upload').val(data);
				}
			});
		}
	});
	
	$('#file-upload-list').delegate('.delete-file', 'click', function() {
		$(this).closest('.list-group-item').remove();
	});
	
	$('#image-upload-container').delegate('.delete-image', 'click', function() {
		$(this).parent().remove();
	});
});