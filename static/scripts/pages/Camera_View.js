"use strict";

window.SaleViewer = window.SaleViewer || {};
var cameras, st_index;
var title_area_height, menu_area_height, max_height, max_width;
var camera_num, rows, cols;
var treeViewCameras;
var cameras_info;
var streaming_address_pref = 'http://192.168.1.131:8080/'
var player;
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

$(function(){
	title_area_height = 0;//$('#title_area').height() + 15;
	menu_area_height = $('#menu_area').height();
	max_height = window.outerHeight - menu_area_height - title_area_height;
	max_width = parseInt((window.outerWidth - 20) * 10 / 12) - 30;
	var TreeViewItems = [
		{
			ID: "1",
			name: "Grid Settings",
			expanded: true
		},
		{
			ID: "1_1",
			categoryId: "1",
			name: "2 x 3",
			//icon: "static/icons/2 x 3.PNG",
		},
		{
			ID: "1_2",
			categoryId: "1",
			name: "3 x 4",
			//icon: "static/icons/3 x 4.PNG",
		},
		{
			ID: "1_3",
			categoryId: "1",
			name: "4 x 5",
			//icon: "static/icons/4 x 5.PNG",
		},
		{
			ID: "1_4",
			categoryId: "1",
			name: "5 x 6",
			//icon: "static/icons/5 x 6.PNG",
		},
		{
			ID: "1_5",
			categoryId: "1",
			name: "6 x 7",
			//icon: "static/icons/6 x 7.PNG",
		},
	]; // a.concat(b);
    $("#treeViewGrid").dxTreeView({ 
        items: TreeViewItems,
        dataStructure: "plain",
        parentIdExpr: "categoryId",
        keyExpr: "ID",
        displayExpr: "name",
		height: max_height * 0.3,
        onItemClick: function(e) {
			if (e.itemData.name == "Grid Settings") return;
			var item_info = e.itemData.name.split(' ');
			rows = parseInt(item_info[0]);
			cols = parseInt(item_info[2]);
			grid_setting();
        }
    });
    treeViewCameras = $("#treeViewCameras").dxTreeView({ 
        items: [{}],
        dataStructure: "plain",
        parentIdExpr: "categoryId",
        keyExpr: "ID",
        displayExpr: "camera_name",
		showCheckBoxesMode: "normal",
		height: max_height * 0.55,
        onSelectionChanged: function(e) {
            //console.log(e.itemData.selected);
        },
        onItemClick: function(e) {
			console.log(e.itemData.selected);
        }
    }).dxTreeView("instance");
	$('#CameraViewButton').dxButton({
		text: 'Camera View',
		onClick: function() {
			cameras_info = [];
			var nodes = treeViewCameras.getSelectedNodes();
			for(var i = 0; i < nodes.length; i++){
				if (nodes[i].itemData.ID == "1") continue;
				//cameras_info.push({camera_name: nodes[i].itemData.camera_name, camera_url: nodes[i].itemData.camera_url})
				cameras_info.push(nodes[i].itemData.camera_name)
			}
			grid_setting();
		}
	});
	rows = 2; cols = 3;
	grid_setting()

	$.ajax({
		url: '/bk/Camera_View',
		data: {},
		error: function (result) {
			alert("There is a Problem, Try Again!");			
		},
		success: function (result) {
			result = JSON.parse(result);
			treeViewCameras.option("items", result);
		}
	});	
});

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function grid_setting() {
	if (cameras_info == undefined) cameras_info = [];
	if (player != undefined) {
		player.forEach(player_finish);
	}
	player = [];
	$('#camera_area').children().remove();
	camera_num = rows * cols;
	var cell_width = parseInt(max_width / cols) - 1;
	var cell_height = parseInt(max_height / rows);
	for (var i = 0; i < camera_num; i++){
		var video_id = 'video_js_id' + String(i);
		var vcell_str;
		if (i < cameras_info.length){
			vcell_str = "<video-js id='" + video_id + "' class='vjs-default-skin camera_video' controls preload='auto'>"
			vcell_str += "<source src='" + streaming_address_pref + cameras_info[i] + ".m3u8' type='application/x-mpegURL'>"
			vcell_str += "</video-js>"
		}
		else {
			vcell_str = "<img class='camera_video_empty' src='static/images/no connected.jpg'/>"
		}
		var acell = $('<div/>');
		var pcell = $("<p id='camera_name" + String(i) + "' class='camera_title'></p>");
		var vcell = $(vcell_str);
		acell.addClass('video-cell');
		pcell.appendTo(acell);
		vcell.appendTo(acell);
		if (i < cameras_info.length){
			var bcell = $('<button onclick="snapshot(' + "'" + video_id + "'" + ')">SnapShot</button>');
			bcell.appendTo(acell);
		}
		acell.appendTo($('#camera_area'));
		if (i < cameras_info.length){
			document.getElementById("camera_name" + String(i)).textContent = cameras_info[i];
			player.push(videojs(video_id));
		}
	}
	player.forEach(player_start);
	$('.video-cell').width(cell_width);
	$('.video-cell').height(cell_height);
	$('.camera_video').width(cell_width * 0.99);
	$('.camera_video').height(cell_height * 0.9);
	$('.camera_video_empty').width(cell_width * 0.99);
	$('.camera_video_empty').height(cell_height * 0.99);
}

function player_start(single_player, index){
	single_player.ready(function() {
	  setTimeout(function() {
		single_player.autoplay('muted');
	  }, 1000);
	});
}

function player_finish(single_player, index){
	single_player.dispose();
}

function snapshot(id)
{
	var video = document.getElementById(id);
	var w, h;
	w = video.firstChild.videoWidth; h = video.firstChild.videoHeight;
	canvas.width = w; canvas.height = h;
	context.fillRect(0, 0, w, h);
	context.drawImage(video.firstChild, 0, 0, w, h)
	var dataURL = canvas.toDataURL();
	$("#download").attr("href", dataURL)
	$("#download").attr("download", "snapshot.jpg")
	document.getElementById('download').click();
}

function single_camera(id) {
	var cam_url = $("#camera_url" + id.toString()).attr("src");
	$("#camera_url").attr("src", "");
	$("#camera_url").attr("src", cam_url);
	var cam_name = document.getElementById("camera_name" + id.toString()).textContent;
	document.getElementById("camera_name").textContent = cam_name;
};
