"use strict";

window.SaleViewer = window.SaleViewer || {};
var cameras, st_index;
var title_area_height, menu_area_height, max_height, max_width;
var camera_num;
var treeViewCameras;
var cameras_info;

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
			var rows = parseInt(item_info[0]);
			var cols = parseInt(item_info[2]);
			grid_setting(rows, cols);
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
				cameras_info.push({camera_name: nodes[i].itemData.camera_name, camera_url: nodes[i].itemData.camera_url})
			}
			camera_assign();
		}
	});

	grid_setting(2, 3)

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

function grid_setting(rows, cols) {
	$('#camera_area').children().remove();
	camera_num = rows * cols;
	var cell_width = parseInt(max_width / cols) - 1;
	var cell_height = parseInt(max_height / rows);
	for (var i = 0; i < camera_num; i++){
		var acell = $('<div/>');
		var pcell = $("<p id='camera_name" + String(i) + "' class='camera_title'></p>");
		var vcell = $("<a href='#section2'><img id='camera_url" + String(i) + "' class='camera_video' src='static/images/no connected.jpg'/></a>");
		acell.addClass('video-cell');
		//acell.css('background-color', getRandomColor());
		pcell.appendTo(acell);
		vcell.appendTo(acell);
		acell.appendTo($('#camera_area'));
	}
	$('.video-cell').width(cell_width);
	$('.video-cell').height(cell_height);
	$('.camera_video').width(cell_width * 0.99);
	$('.camera_video').height(cell_height * 0.99);
	camera_assign();
}

function camera_assign() {
	var address = window.location.protocol + "//" + window.location.hostname + ":5001/video_feed1?url=";
	if (cameras_info == undefined) return;
	var uplimit = Math.min(camera_num, cameras_info.length)
	for (var i = 0; i < uplimit; i++){
		document.getElementById("camera_name" + String(i)).textContent = cameras_info[i].camera_name;
		$("#camera_url" + String(i)).attr("src", address + cameras_info[i].camera_url);
	}
	for (var i = uplimit; i < camera_num; i++){
		document.getElementById("camera_name" + String(i)).textContent = "";
		$("#camera_url" + String(i)).attr("src", "static/images/no connected.jpg");
	}	
};

function single_camera(id) {
	var cam_url = $("#camera_url" + id.toString()).attr("src");
	$("#camera_url").attr("src", "");
	$("#camera_url").attr("src", cam_url);
	var cam_name = document.getElementById("camera_name" + id.toString()).textContent;
	document.getElementById("camera_name").textContent = cam_name;
};
