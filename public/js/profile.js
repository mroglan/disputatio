
$(() => {
	$('#profile-pic-div').height($('#profile-pic-div').width());
	
	$('#phone_length').val($('#phone_list').children().length);
	//console.log($('#phone_length').val());
	
	$('#cat_length').val($('#cat_list').children().length);
	
	$('[data-toggle="tooltip"]').tooltip();
	
	$('#reserve_option').val($('#reserve_button').val());
	
	$('#pic_btn').click(function(e) {
		e.preventDefault();
		$('#pic_file').trigger('click');
	});
	
	$('.carousel').carousel({
		interval: false
	});
	
	setFriends();
	
	$('#pic_file').change(function() {
		
		let formdata = new FormData();
		if($(this).prop('files').length > 0) {
			console.log('has files');
			let file = $(this).prop('files')[0];
			formdata.append('image', file);
			
			$.ajax({
				url: '/users/profile/picture',
				type: 'POST',
				data: formdata,
				processData: false,
				contentType: false,
				success: function(data) {
					$('#user_picture').attr('src', data.substring(data.indexOf('c') + 1)).css('min-width', '100%').css('min-height', '100%');
					$('#top_nav_user_picture').attr('src', data.substring(data.indexOf('c') + 1));
					//console.log('success');
				}
			});
		}
	});
	
	$('#friend_search_btn').click(function() {
		let data = $('#friend_search').val();
		$.ajax({
			url: '/users/profile/friends/search',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({'search': data}),
			success: function(data) {
				$('#search_results_1').html('');
				data.forEach(function(user) {
					let picture;
					if(user.picture) picture = user.picture;
					else picture = '/images/blank_profile.png';
					$('#search_results_1').append(`<div class="media search_media">
						<img src=${picture} class="search_result_image mr-3">
						<div class="media-body">
							<h3><span>${user.name}</span><button type="button" class="btn btn-primary search_media_btn">Add</button></h3>
							Status: ${user.status || 'none'}
						</div>
						<input type="hidden" value=${user._id}>
					</div>`);
				});
				if(data.length == 0) {
					$('#search_results_1').append('No users found');
				}
				$('#search_results_1').show();
				$('.search_result_image').height($('.search_result_image').width());
				console.log('success');
			}
		});
	});
	
	$('body').delegate('.search_media h3 span', 'click', function() {
		let id = $(this).parent().parent().parent().find('input').val();
		console.log(`/users/${id}/profile`);
		window.location = `/users/${id}/profile`;
	}).delegate('.search_media .search_media_btn', 'click', function() {
		let id = $(this).parent().parent().parent().find('input').val();
		$.ajax({
			url: `/users/${id}/add_friend`,
			type: 'POST', 
			success: function(data) {
				console.log(data);
				if(Array.isArray(data)) {
					$('.carousel-inner').html('');
					$('.friended-count').text(data.length.toString() + ' friended');
					friendCarousel(data, 2);
				} else {
					displayAddError(data);
				}
			}
		});
	}).delegate('.carousel-inner h3', 'click', function() {
		let id = $(this).closest('.card').find('input').val();
		window.location = `/users/${id}/profile`;
	}).delegate('.carousel-inner .card-footer button', 'click', function() {
		let id = $(this).closest('.card').find('input').val();
		$.ajax({
			url: `/users/${id}/remove_friend`,
			type: 'POST',
			success: function(data) {
				console.log(data);
				if(Array.isArray(data)) {
					$('.carousel-inner').html('');
					$('.friended-count').text(data.length.toString() + ' friended');
					friendCarousel(data, 0);
				} else {
					console.log(data);
				}
			}
		});
	});
	
	$('#reserve_button').click(function() {
		$('[data-toggle="tooltip"]').tooltip('hide');
		if($(this).val() == 'false') {
			$(this).removeClass('btn-primary');
			$(this).addClass('btn-danger');
			$(this).val('true');
			$(this).text('Only Friends');
		} else {
			$(this).removeClass('btn-danger');
			$(this).addClass('btn-primary');
			$(this).val('false');
			$(this).text('Anyone');
		}
		$('#reserve_option').val($(this).val());
	});
	
	$('#add_phone_btn').click(function() {
		if(parseInt($('#phone_length').val()) < 4) {
			let disabledArray = [false, false, false];
			$('#phone_list').children().each(function() {
				//console.log($(this).find('select').val());
				if($(this).find('select').val() == 'home') disabledArray[0] = true;
				else if($(this).find('select').val() == 'mobile') disabledArray[1] = true;
				else if($(this).find('select').val() == 'work') disabledArray[2] = true;
			});
			//console.log(disabledArray);
			$('#phone_list').append($('#phone_list_item').clone());
			let num = $('#phone_list').children().length;
			$('#phone_list').children().last().removeAttr('id').find('input').attr('name', 'phone_number_' + num).val('').closest('.list-group-item').find('select').attr('name', 'phone_name_' + num);
			$('#phone_list').children().last().find('select').children().last().attr('selected', 'selected').parent().children().each(function(index) {
				//console.log(index);
				if(disabledArray[index] && index < 3) {
					//console.log('disabled for index ' + index);
					$(this).attr('disabled', 'disabled');
				}
			});
			$('#phone_length').val(parseInt($('#phone_length').val()) + 1);
			//console.log($('#phone_length').val());
		}
	});
	
	$('#remove_phone_btn').click(function() {
		if($('#phone_list').children().length > 1) {
			$('#phone_list').children().last().remove();
			$('#phone_length').val(parseInt($('#phone_length').val()) -1);
		}
	});
	
	$('#add_cat_btn').click(function() {
		if(parseInt($('#cat_length').val()) < 5) {
			$('#cat_list').append($('#cat_list_item').clone());
			let num = $('#cat_list').children().length;
			$('#cat_list').children().last().removeAttr('id').find('.col-md-4').children('input').attr('name', 'cat_name_' + num).val('').closest('.list-group-item').find('.col-md-8').children('input').attr('name', 'cat_detail_' + num).val('');
			$('#cat_length').val(parseInt($('#cat_length').val()) + 1);
			//console.log($('#cat_length').val());
		}
	});
	
	$('#remove_cat_btn').click(function() {
		if($('#cat_list').children().length > 1) {
			$('#cat_list').children().last().remove();
			$('#cat_length').val(parseInt($('#cat_length').val()) - 1);
		}
	});
	
	$('#toggle_contact_body').click(function() {
		if($(this).val() == 'shown') {
			$(this).val('hidden').removeClass('btn-danger').addClass('btn-primary').text('Show');
		} else {
			$(this).val('shown').removeClass('btn-primary').addClass('btn-danger').text('Hide');
		}
		$('#contact-body').slideToggle(1000);
	});
	
	var x = window.matchMedia("(max-width: 992px)");
	changeBorder(x);
	x.addListener(changeBorder);
});

function changeBorder(x) {
	if(x.matches) {
		$('#user_info').removeClass('rounded-pill');
	}
}

function setFriends() {
	$.ajax({
		url: '/users/profile/give_friends',
		type: 'GET',
		success: function(data) {
			friendCarousel(data, 0);
		}
	});
}

function friendCarousel(friends, num) {
	let friendArray = [];
	while(friends.length > 2) {
		friendArray.push(friends.splice(0, 2));
	}
	friendArray.push(friends.splice(0));
	if(num == 2) num = friendArray.length - 1;
	friendArray.forEach(function(friendGroup, index) {
		friendSlide(friendGroup, index, num);
	});
}

function friendSlide(group, i, num) {
	//console.log(group);
	$('.carousel-inner').append(`<div class="carousel-item ${i == num ? 'active' : ''}"><div class="row no-gutters card-group"></div></div>`);
	group.forEach(function(friend) {
		//console.log(friend);
		$('.carousel-inner').children().last().find('.row').append($('#friends_template').clone());
		$('.carousel-inner').children().last().find('.row').children().last().removeAttr('id').removeClass('hidden').find('img').attr('src', friend.picture || '/images/blank_profile.png')
		.closest('.card').find('.card-title').text(friend.name).closest('.card').find('.card-subtitle').text(`<${friend.tag}>`).closest('.card').find('input').val(friend._id);
	});
	//$('.friend_pic_div').height($('.friend_pic_div').width());
}

function displayAddError(error) {
	$('#add_errors').html('').append(`
	<div class="alert alert-warning alert-dismissible fade show" role="alert">
		${error}
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>`);
}	
	
