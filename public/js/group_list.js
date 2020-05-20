$(() => {
	
	if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
		window.location.reload(true);
	}
	
	sizeProfilePicDiv();
	
	$('.full-height').height($('#page-content-wrapper').height() - $('#groups-title').parent().height());
	
	$('[data-toggle="tooltip"]').tooltip();
	
	$('.carousel').carousel({
		interval: false
	});
	
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
	
	$('#reply-file-upload-btn').click(function() {
		$('#reply-file-upload').trigger('click');
	});
	
	$('#reply-file-upload').change(function() {
		let formdata = new FormData();
		if($(this).prop('files').length > 0) {
			//console.log('has files');
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
					$('#reply-file-upload-list').append($('#reply-file-upload-item-template').clone());
					$('#reply-file-upload-list').children().last().removeAttr('id').removeClass('hidden').find('.filename').text(data.name).attr('href', `${data.path}`)
					.closest('.list-group-item').find('input.reply-file-path').val(data.path)
					.closest('.list-group-item').find('input.reply-file-name').val(data.name);
				}
			});
		}
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
					.closest('.list-group-item').find('input.file-path').attr('name', 'file_upload').val(data.path)
					.closest('.list-group-item').find('input.file-name').attr('name', 'file_name').val(data.name);
				}
			});
		}
	});
	
	$('#reply-image-upload-btn').click(function() {
		$('#reply-image-upload').trigger('click');
	});
	
	$('#reply-image-upload').change(function() {
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
					$('#reply-image-upload-container').append($('#reply-image-upload-template').clone());
					$('#reply-image-upload-container').children().last().removeAttr('id').removeClass('hidden').find('img').attr('src', data).parent()
					.find('input').val(data);
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
	
	$('#file-upload-list, #reply-file-upload-list').delegate('.delete-file', 'click', function() {
		$(this).closest('.list-group-item').remove();
	});
	
	$('#image-upload-container, #reply-image-upload-container').delegate('.delete-image', 'click', function() {
		$(this).parent().remove();
	});
	
	editPosts();
	
	function formatDate(date) {
		let d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) 
			month = '0' + month;
		if (day.length < 2) 
			day = '0' + day;

		return [year, month, day].join('-');
	}
	
	$('#load-more-btn').click(function() {
		disableButton($(this));
		$.ajax({
			url: '',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'count': $('#post-list').children().length}),
			success: function(data) {
				let userId = $('#userId').val();
				data.forEach(function(post) {
					if(post.special === 'share') {
						$('#post-list').append('<div class="hidden"></div>');
						return;
					}
					if(post.original) {
						$('#post-list').append($('#post-original-template').clone());
						let card = $('#post-list').children().last();
						card.find('.postId').val(post._id);
						card.find('.postGroupId').val(post.group._id || post.group);
						card.removeClass('hidden').attr('id', post._id).children('.card-header').find('.profile-pic-div img').attr('src', post.writer.picture || '/images/blank_profile.png');
						card.find('.card-header').find('.writer-name').find('a').attr('href', `/users/${post.writer._id}/profile`).text(post.writer.name).parent().next()
						.find('a').attr('href', `/user/${post.writer._id}/profile`).text(`<${post.writer.tag}>`);
						card.children('.card-header').find('.post-date').text(formatDate(post.date));
						card.children('.card-header').find('.post-message').text(post.message);
						card.children('.card-footer').find('.reply-info').find('.number').text(post.replies.length);
						card.children('.card-footer').find('.share-info').find('.icon').addClass(post.shares.includes(userId) ? 'text-success' : '').parent().find('.number').text(post.shares.length);
						card.children('.card-footer').find('.like-info').find('.icon').addClass(post.likes.includes(userId) ? 'text-success' : '').parent().find('.number').text(post.likes.length);
						card.children('.card-footer').find('.dislike-info').find('.icon').addClass(post.dislikes.includes(userId) ? 'text-danger' : '').parent().find('.number').text(post.dislikes.length);
						
						let originalCard = card.children('.card-body').find('.card');
						originalCard.find('.originalPostId').val(post.original._id);
						originalCard.find('.originalPostGroupId').val(post.original.group._id);
						originalCard.find('.profile-pic-div img').attr('src', post.original.writer.picture || '/images/blank_profile.png');
						originalCard.find('.writer-name').find('a').attr('href', `/users/${post.original.writer._id}/profile`).text(post.original.writer.name).parent().next()
						.find('a').attr('href', `/users/${post.original.writer._id}/profile`).text(`<${post.original.writer.tag}>`);
						originalCard.find('.post-date').text(formatDate(post.original.date));
						originalCard.find('.post-title').text(post.original.title);
						originalCard.find('.post-message').text(post.original.message).next('input').val('unedited');
						if(post.original.images) {
							post.original.images.forEach(function(image) {
								originalCard.find('.image-list').append(`<a href="${image}"><img style="max-height:200px" src="${image}"></a>`);
							});
						}
						if(post.original.files) {
							post.original.files.forEach(function(file) {
								originalCard.find('ul').append(`<li class="list-group-item"><a href="${file.path}">${file.name}</a></li>`);
							});
						}
						return;
					}
					$('#post-list').append($('#post-template').clone());
					let card = $('#post-list').children().last();
					card.find('.postId').val(post._id);
					card.find('.postGroupId').val(post.group._id || post.group);
					card.removeClass('d-none').attr('id', post._id).find('.profile-pic-div img').attr('src', post.writer.picture || '/images/blank_profile.png');
					card.find('.writer-name').find('a').attr('href', `/users/${post.writer._id}/profile`).text(post.writer.name).closest('div').children().last()
					.find('a').attr('href', `/users/${post.writer._id}/profile`).text(`<${post.writer.tag}>`);
					card.find('.post-date').text(formatDate(post.date));
					card.find('.group-identifyer').find('a').attr('href', `/chats/groups/${post.group._id}`).text(post.group.name);
					card.find('.post-title').text(post.title);
					card.find('.post-message').text(post.message).next('input').val('unedited');
					post.images.forEach(function(image) {
						card.find('.image-list').append(`<a href="${image}"><img style="max-height:200px" src="${image}"></a>`);
					});
					post.files.forEach(function(file) {
						card.find('ul').append(`<li class="list-group-item"><a href="${file.path}">${file.name}</a></li>`);
					});
					card.find('.reply-info').find('.number').text(post.replies.length);
					card.find('.share-info').find('.icon').addClass(post.shares.includes(userId) ? 'text-success' : '').parent().find('.number').text(post.shares.length);
					card.find('.like-info').find('.icon').addClass(post.likes.includes(userId) ? 'text-success' : '').parent().find('.number').text(post.likes.length);
					card.find('.dislike-info').find('.icon').addClass(post.dislikes.includes(userId) ? 'text-danger' : '').parent().find('.number').text(post.dislikes.length);
				});
				if(data.length < 10) {
					$('#load-more-btn').addClass('d-none');
				}
				editPosts();
				sizeProfilePicDiv();
				reenableButton($('#load-more-btn'));
			}
		});
	});
	
	$('.delete-group-select').click(function() {
		if($(this).find('input').prop('checked') == true) {
			$(this).find('input').prop('checked',false)
			$(this).removeClass('border-danger').addClass('border-primary').find('.col-2 span').removeClass('text-danger').addClass('text-dark');
		} else {
			$(this).find('input').prop('checked',true)
			$(this).removeClass('border-primary').addClass('border-danger').find('.col-2 span').removeClass('text-dark').addClass('text-danger');
		}
		//console.log($(this).find('input'));
	});
	
	$('.leave-group').click(function() {
		$.ajax({
			url: '/chats/groups/delete_groups',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'delete_group': $('#selectedId').val()}),
			complete: function(data) {
				window.location = '/chats/groups';
			}
		});
	});
	
	$('.join-group').click(function() {
		$.ajax({
			url: '/chats/groups/join_group',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'join_group': $('#selectedId').val()}),
			success: function(data) {
				window.location.reload(true);
			}
		});
	});
	
	$('.add-group-user').click(function() {
		if($(this).find('input').prop('checked') == true) {
			$(this).find('input').prop('checked', false);
			$(this).removeClass('border-success').addClass('border-light');
		} else {
			$(this).find('input').prop('checked', true);
			$(this).removeClass('border-light').addClass('border-success');
		}
	});
	
	$('.accept-invite-btn').click(function() {
		let group = $(this).parent().find('.inviteGroupId').val();
		let invite = $(this).parent().find('.inviteId').val();
		//console.log(group + ', ' + invite);
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
	
	let userReferenceClick = false;
	
	$('body').delegate('.user-reference-link', 'click', function() {
		userReferenceClick = true;
	});
	
	$('body').delegate('.post-content', 'click', function() {
		if(userReferenceClick) return;
		let postId = $(this).closest('.card').find('.postId').val();
		let postGroupId = $(this).closest('.card').find('.postGroupId').val();
		if($(this).closest('.card').children().last().hasClass('media')) {
			$(this).closest('.card').find('.card-footer').nextAll().remove();
		} else {
			loadReplies(postId);
		}
	}).delegate('.like-info', 'click', function() {
		let likeButton = $(this), postId = $(this).closest('.card').find('.postId').val(), userId = $('#userId').val();
		let alreadyDisliked = $(this).parent().find('.dislike-info').find('.icon').hasClass('text-danger');
		$.ajax({
			url: '/chats/groups/like_post',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'postId': postId}),
			success: function(data) {
				let count = parseInt(likeButton.find('.number').text());
				if(data.includes(userId)) {
					likeButton.find('.icon').addClass('text-success');
					likeButton.find('.number').text(count + 1);
					if(alreadyDisliked) {
						let disCount = parseInt(likeButton.parent().find('.dislike-info').find('.number').text());
						likeButton.parent().find('.dislike-info').find('.icon').removeClass('text-danger').parent().find('.number').text(disCount - 1);
					}
				} else {
					likeButton.find('.icon').removeClass('text-success');
					likeButton.find('.number').text(count - 1);
				}
			}
		});
	}).delegate('.dislike-info', 'click', function() {
		let dislikeButton = $(this), postId = $(this).closest('.card').find('.postId').val(), userId = $('#userId').val();
		let alreadyLiked = $(this).parent().find('.like-info').find('.icon').hasClass('text-success');
		$.ajax({
			url: '/chats/groups/dislike_post',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'postId': postId}),
			success: function(data) {
				let count = parseInt(dislikeButton.find('.number').text());
				if(data.includes(userId)) {
					dislikeButton.find('.icon').addClass('text-danger');
					dislikeButton.find('.number').text(count + 1);
					if(alreadyLiked) {
						let likeCount = parseInt(dislikeButton.parent().find('.like-info').find('.number').text());
						dislikeButton.parent().find('.like-info').find('.icon').removeClass('text-success').parent().find('.number').text(likeCount - 1);
					}
				} else {
					dislikeButton.find('.icon').removeClass('text-danger');
					dislikeButton.find('.number').text(count - 1);
				}
			}
		});
	}).delegate('.reply-info', 'click', function() {
		$('#reply-file-upload-list').html('');
		$('#reply-image-upload-container').html('');
		$('#new-reply-message').val('');
		if($('#parent-id').val() === $(this).closest('.card').find('.postId').val()) {
			$('#new-reply-container').append($('#new-reply'));
			$('#parent-id').val('');
			return;
		}
		$(this).closest('.card').children('.card-footer').after($('#new-reply'));
		$('#typeof-reply').val('post');
		$('#parent-id').val($(this).closest('.card').find('.postId').val());
	}).delegate('.reply-like-info', 'click', function() {
		let likeButton = $(this), replyId = $(this).closest('.card-footer').find('.replyId').val(), userId = $('#userId').val();
		let alreadyDisliked = $(this).closest('.card-footer').find('.reply-dislike-info').find('.icon').hasClass('text-danger');
		$.ajax({
			url: '/chats/groups/like_reply',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'replyId': replyId}),
			success: function(data) {
				let count = parseInt(likeButton.find('.number').text());
				if(data.includes(userId)) {
					likeButton.find('.icon').addClass('text-success');
					likeButton.find('.number').text(count + 1);
					if(alreadyDisliked) {
						let disCount = parseInt(likeButton.closest('.card-footer').find('.reply-dislike-info').find('.number').text());
						likeButton.closest('.card-footer').find('.reply-dislike-info').find('.icon').removeClass('text-danger').parent().find('.number').text(disCount - 1);
					}
				} else {
					likeButton.find('.icon').removeClass('text-success');
					likeButton.find('.number').text(count - 1);
				}
			}
		});
	}).delegate('.reply-dislike-info', 'click', function() {
		let dislikeButton = $(this), replyId = $(this).closest('.card-footer').find('.replyId').val(), userId = $('#userId').val();
		let alreadyLiked = $(this).closest('.card-footer').find('.reply-like-info').find('.icon').hasClass('text-success');
		$.ajax({
			url: '/chats/groups/dislike_reply',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'replyId': replyId}),
			success: function(data) {
				let count = parseInt(dislikeButton.find('.number').text());
				if(data.includes(userId)) {
					dislikeButton.find('.icon').addClass('text-danger');
					dislikeButton.find('.number').text(count + 1);
					if(alreadyLiked) {
						let likeCount = parseInt(dislikeButton.closest('.card-footer').find('.reply-like-info').find('.number').text());
						dislikeButton.closest('.card-footer').find('.reply-like-info').find('.icon').removeClass('text-success').parent().find('.number').text(likeCount - 1);
					}
				} else {
					dislikeButton.find('.icon').removeClass('text-danger');
					dislikeButton.find('.number').text(count - 1);
				}
			}
		});
	}).delegate('.reply-reply-info', 'click', function() {
		$('#reply-file-upload-list').html('');
		$('#reply-image-upload-container').html('');
		$('#new-reply-message').val('');
		if($('#parent-id').val() === $(this).closest('.card-footer').find('.replyId').val()) {
			$('#new-reply-container').append($('#new-reply'));
			$('#parent-id').val('');
			return;
		}
		$(this).closest('.card-footer').after($('#new-reply'));
		$('#typeof-reply').val('reply');
		$('#parent-id').val($(this).closest('.card-footer').find('.replyId').val());
	}).delegate('.reply-content', 'click', function() {
		if(userReferenceClick) return;
		let replyId = $(this).closest('.media-body').children('.card-footer').find('.replyId').val();
		if($(this).closest('.media-body').children().last().hasClass('media')) {
			$(this).closest('.media-body').children('.card-footer').nextAll().remove();
		} else {
			loadReplyReplies(replyId);
		}
	}).delegate('.share-content', 'click', function() {
		if(userReferenceClick) return;
		let groupId = $(this).closest('.card').find('.originalPostGroupId').val(), postId = $(this).closest('.card').find('.originalPostId').val();
		window.location = `/chats/groups/${groupId}#${postId}`;
	});
	
	$('#reply-btn').click(function() {
		let replyBtn = $(this);
		let filePathArray = [], fileNameArray = [], imageArray = [];
		$('.reply-file-path').each(function() {
			if($(this).val() != 'template') {
				filePathArray.push($(this).val());
			}
		});
		$('.reply-file-name').each(function() {
			if($(this).val() != 'template') {
				fileNameArray.push($(this).val());
			}
		});
		$('.reply-image-path').each(function() {
			if($(this).val() != 'template') {
				imageArray.push($(this).val());
			}
		});
		let data = {
			message: $('#new-reply-message').val(),
			filePaths: filePathArray,
			fileNames: fileNameArray,
			images: imageArray
		}
		if($('#typeof-reply').val() === 'post') {
			$.ajax({
				url: `/chats/groups/${$('#parent-id').val()}/post_reply`,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(data),
				success: function(data) {
					loadReplies(replyBtn.closest('.card').find('.postId').val());
				}
			});
		} else {
			$.ajax({
				url: `/chats/groups/${$('#parent-id').val()}/reply_reply`,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(data),
				success: function(data) {
					loadReplyReplies(replyBtn.closest('.media').find('.card-footer .replyId').val());
				}
			});
		}
	});
	
	$('#shareModal').on('show.bs.modal', function(event) {
		let groupId = $(event.relatedTarget).closest('.card').find('.postGroupId').val();
		let postId = $(event.relatedTarget).closest('.card').find('.postId').val();
		$(this).find('.list-group-item').each(function() {
			if($(this).find('input').val() === groupId) {
				$(this).hide();
			}
		});
		$('#sharePostId').val(postId);
	}).on('shown.bs.modal', function(event) {
		sizeProfilePicDiv();
	});
	
	$('#share-btn').click(function() {
		let shareButton = $('body').find(`input[value=${$('#sharePostId').val()}].postId`).closest('.card').children('.card-footer').find('.share-info');
		//console.log(shareButton);
		let groupArray = [];
		$('.share-group-input').each(function() {
			if($(this).prop('checked')) {
				groupArray.push($(this).val());
			}
		});
		let data = {
			groups: groupArray,
			sharePost: $('#sharePostId').val(),
			message: $('#share-message').val()
		}
		$.ajax({
			url: '/chats/groups/share_post',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(data) {
				$('#shareModal').find('.list-group-item').show().removeClass('border-success').addClass('border-light');
				$('#shareModal').find('.share-group-input').prop('checked', false);
				$('#shareModal').modal('hide');
				let count = parseInt(shareButton.find('.number').text());
				shareButton.find('.icon').addClass('text-success').next().text(count + 1);
			}
		});
	});
	
	$('.share-group-select').click(function() {
		if($(this).hasClass('border-success')) {
			$(this).removeClass('border-success').addClass('border-light');
			$(this).find('.share-group-input').prop('checked', false);
		} else {
			$(this).removeClass('border-light').addClass('border-success');
			$(this).find('.share-group-input').prop('checked', true);
		}
	});
	
	checkSidebar();
	
	$('.accept-invite-btn2').click(function() {
		let acceptButton = $(this);
		console.log($('#selectedId').val());
		$.ajax({
			url: '/chats/groups/accept_invite',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'group': $('#selectedId').val(), 'inviteId': acceptButton.next().val()}),
			success: function(data) {
				window.location.reload(true);
			}
		});
	});
	
	$('#status').change(function() {
		if($(this).val() === 'closed' || $(this).val() === 'invite_only') {
			$('#closed-code').removeClass('d-none');
		} else {
			$('#closed-code').addClass('d-none');
		}
	});
	
	$('#code-input-btn').click(function() {
		let footer = $(this).closest('.modal-footer');
		$.ajax({
			url: '/chats/groups/code_entry',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'code': $('#code-input').val(), 'group': $('#selectedId').val()}),
			success: function(data) {
				if(data === 'negative') {
					footer.append('<div class="w-100">Code Incorrect!</div>');
				} else {
					window.location.reload(true);
				}
			}
		});
	});
	
	$.ajax({
		url: '/chats/groups/find_recommended_groups',
		type: 'GET',
		success: function(data) {
			data.forEach(function(group) {
				$('#recommended-list').append($('#recommended-group-template').clone());
				$('#recommended-list').children().last().removeAttr('id').attr('href', `/chats/groups/${group._id}`)
				.find('img').attr('src', group.picture || '/images/oort-cloud.jpg').closest('a').find('h6').text(group.name);
			});
			if(data.length === 0) {
				$('#recommended-list').append('<div class="px-3">You have no recommended groups currently!</div>');
			}
			sizeProfilePicDiv();
		}
	});
});

function editPosts() {
	$('.post-message, .reply-message').each(function() {
		if($(this).next('input').val() === 'edited') return;
		let wordArray = $(this).text().split(' ');
		wordArray.forEach(function(word, index) {
			//console.log(word.trim());
			if(word.trim().charAt(0) != '<') return;
			let newWord = word.substring(word.indexOf('<') + 1, word.indexOf('>'));
			//console.log(newWord);
			wordArray[index] = `<a href="/users/profile/find/${newWord}" class="user-reference-link" style="z-index:20">&lt;${newWord}&gt;</a>`;
		});
		//console.log(wordArray);
		$(this).html(wordArray.join(' '));
		$(this).next('input').val('edited');
	});
}

function sizeProfilePicDiv() {
	$('.profile-pic-div').each(function() {
		$(this).height($(this).width());
	});
}

function disableButton(button) {
	button.attr('disabled', 'disabled');
	button.children().toggleClass('d-none');
}

function reenableButton(button) {
	button.removeAttr('disabled');
	button.children().toggleClass('d-none');
}

function loadReplies(postId) {
	let card = $('body').find(`input[value=${postId}]`).closest('.card'), userId = $('#userId').val();
	card.find('.card-footer').nextAll().remove();
	//console.log(card);
	$.ajax({
		url: `/chats/groups/${postId}/replies`,
		type: 'GET',
		success: function(data) {
			$('#new-reply-container').append('#new-reply');
			data.forEach(function(post) {
				card.append($('#reply-template').clone());
				card.children().last().removeAttr('id').find('img').attr('src', post.writer.picture || '/images/blank_profile.png')
				.closest('.media').find('h6').text(post.writer._id === userId ? 'You' : post.writer.name).next().text(`<${post.writer.tag}>`).parent().attr('href', `/users/${post.writer._id}/profile`);
				card.children().last().find('.reply-message').text(post.message);
				post.images.forEach(function(image) {
					card.children().last().find('.reply-images').append(`<a href="${image}"><img style="max-height:200px" src="${image}"></a>`);
				});
				post.files.forEach(function(file) {
					card.children().last().find('.reply-file-list').append(`<li class="list-group-item"><a href="${file.path}">${file.name}</a></li>`);
				});
				card.children().last().find('.card-footer').find('.reply-reply-info .number').text(post.replies.length).closest('.card-footer')
				.find('.reply-like-info .icon').addClass(post.likes.includes(userId) ? 'text-success' : '').next().text(post.likes.length).closest('.card-footer')
				.find('.reply-dislike-info .icon').addClass(post.dislikes.includes(userId) ? 'text-danger' : '').next().text(post.dislikes.length).closest('.card-footer')
				.find('.replyId').val(post._id);
			});
			editPosts();
		}
	});
}

function loadReplyReplies(replyId) {
	let media = $('body').find(`input[value=${replyId}]`).closest('.media-body'), userId = $('#userId').val();
	media.find('.card-footer').nextAll().remove();
	console.log(replyId);
	$.ajax({
		url: `/chats/groups/${replyId}/reply/replies`,
		type: 'GET',
		success: function(data) {
			$('#new-reply-container').append($('#new-reply'));
			data.forEach(function(reply) {
				media.append($('#reply-template').clone());
				//console.log(media.children().last());
				media.children().last().removeAttr('id').find('img').attr('src', reply.writer.picture || '/images/blank_profile.png')
				.closest('.media').find('h6').text(reply.writer._id === userId ? 'You' : reply.writer.name).next().text(`<${reply.writer.tag}>`).parent().attr('href', `/users/${reply.writer._id}/profile`);
				media.children().last().find('.reply-message').text(reply.message);
				reply.images.forEach(function(image) {
					media.children().last().find('.reply-images').append(`<a href="${image}"><img style="max-height:200px" src="${image}"></a>`);
				});
				reply.files.forEach(function(file) {
					media.children().last().find('.reply-file-list').append(`<li class="list-group-item"><a href="${file.path}">${file.name}</a></li>`);
				});
				media.children().last().find('.reply-reply-info .number').text(reply.replies.length).closest('.card-footer')
				.find('.reply-like-info .icon').addClass(reply.likes.includes(userId) ? 'text-success' : '').next().text(reply.likes.length).closest('.card-footer')
				.find('.reply-dislike-info .icon').addClass(reply.dislikes.includes(userId) ? 'text-danger' : '').next().text(reply.dislikes.length).closest('.card-footer')
				.find('.replyId').val(reply._id);
			});
			editPosts();
		}
	});
}

function checkSidebar() {
	$.ajax({
		url: '/chats/groups/notifications',
		type: 'POST',
		success: function(data) {
			console.log(data);
			data.forEach(function(group) {
				if(group.posts.length === 0) return;
				console.log($(`#link-${group.id}`));
				$(`#link-${group.id}`).find('.badge').text(group.posts.length);
			});
		},
		complete: function(data) {
			setTimeout(checkSidebar, 5000);
		}
	});
}