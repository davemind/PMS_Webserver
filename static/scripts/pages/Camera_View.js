"use strict";

window.SaleViewer = window.SaleViewer || {};
var cameras, st_index;
var title_area_height, menu_area_height, max_height, max_width;
var camera_num;

$(function(){
	title_area_height = 0;//$('#title_area').height() + 15;
	menu_area_height = $('#menu_area').height();
	max_height = window.outerHeight - menu_area_height - title_area_height;
	max_width = parseInt((window.outerWidth - 20) * 11 / 12) - 30;
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
		},
		{
			ID: "1_2",
			categoryId: "1",
			name: "3 x 4",
		},
		{
			ID: "1_3",
			categoryId: "1",
			name: "4 x 5",
		},
		{
			ID: "1_4",
			categoryId: "1",
			name: "5 x 6",
		},
		{
			ID: "1_5",
			categoryId: "1",
			name: "6 x 7",
		},
	]; // a.concat(b);
    $("#treeView").dxTreeView({ 
        items: TreeViewItems,
        dataStructure: "plain",
        parentIdExpr: "categoryId",
        keyExpr: "ID",
        displayExpr: "name",
        //width: 300,
        onItemClick: function(e) {
			if (e.itemData.name == "Grid Settings") return;
			var item_info = e.itemData.name.split(' ');
			var rows = parseInt(item_info[0]);
			var cols = parseInt(item_info[2]);
			grid_setting(rows, cols);
        }
    });
	grid_setting(2, 3)
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
}

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
