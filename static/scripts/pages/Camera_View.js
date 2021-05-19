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
			var address = window.location.protocol + "//" + window.location.hostname + ":5001/video_feed";
			cameras = JSON.parse(result);
		}
	});	
};

function single_camera(id) {
	var cam_url = $("#camera_url" + id.toString()).attr("src");
	$("#camera_url").attr("src", "");
	$("#camera_url").attr("src", cam_url);
	var cam_name = document.getElementById("camera_name" + id.toString()).textContent;
	document.getElementById("camera_name").textContent = cam_name;
};
