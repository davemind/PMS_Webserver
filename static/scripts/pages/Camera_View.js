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
			for (var i = st_index; i < Math.min(cameras.length, st_index + 6); ++i) {
				var j = i % 6 + 1;
				document.getElementById("camera_name" + j.toString()).textContent = cameras[i].camera_name;
				$("#camera_url" + j.toString()).attr("src", "http://localhost:5001/video_feed" + j.toString() + "?url=" + cameras[i].camera_url)
			}
		}
	});	
};

function single_camera(src_url) {
	$("#camera_url").attr("src", src_url);
};
