
$(() => {
	
	$('#profile-pic-div').height($('#profile-pic-div').width());
	
	var id = $('#profile-id').val();
	console.log('hello');
	$.ajax({
		url: `/users/${id}/profile/friendinfo`,
		type: 'POST',
		success: function(data) {
			//console.log('success');
			$('#friended_num').append(data + ' friended');
		}
	});
	
});