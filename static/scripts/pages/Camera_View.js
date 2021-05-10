"use strict";

window.SaleViewer = window.SaleViewer || {};
var cameras, st_index;

function myFunction() {
	$.ajax({
		url: '/bk/Camera_View',
		data: {},
		error: function (result) {
			alert("There is a Problem, Try Again!");			
		},
		success: function (result) {
			st_index = 0;
			cameras = JSON.parse(result);
			for (var i = st_index; i < Math.min(cameras.length, st_index + 12); ++i) {
				var j = i % 12 + 1;
				document.getElementById("camera_name" + j.toString()).textContent = cameras[i].camera_name;
				$("#camera_url" + j.toString()).attr("src", "/video_feed" + j.toString() + "?url=" + cameras[i].camera_url)
			}
		}
	});	
};
