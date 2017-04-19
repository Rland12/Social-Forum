$(document).ready(function() {

	$("#enter").click(function(event) {
		event.preventDefault();

		var text = $("#text").val();

		$('#text').focus();

		$("#text").val("");


		$("#wall").prepend("<div>" + "<img id='profile' src='http://www.scass.ae/en/About1/PublishingImages/Pages/staff/nophoto.jpg'>" + text + "</div>");
		$("#wall").css("background-color", "rgba(0, 0, 0, 0.8)");
		$("#wall").css("font-size", 25);
		$("#profile").width(90);
		$("#profile").css("margin-right", 20);
		$("#profile").css("margin-top", 43);


	});
	

});

