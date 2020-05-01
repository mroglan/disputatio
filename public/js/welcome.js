$(() => {
	if($('#navbarContent').is(':visible')) {
		$('.navbar').css('background', 'transparent');
	} else {
		console.log('not visible');
		$('.navbar').css('background', 'rgba(141,26,199,1)');
	}
	$(window).resize(function() {
		if($('#navbarContent').is(':visible')) {
			$('.navbar').css('background', 'transparent');
		} else {
			console.log('not visible');
			$('.navbar').css('background', 'rgba(141,26,199,1)');
		}
	});
});