"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
	var camera_names;
	var group_ids;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "Group";
		var selectFirst;          
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				camera_names = data['cameras'];
				group_ids = data['group_ids'];
				var gridOptions = {
					keyExpr: "id",
					parentIdExpr: "parent_id",
					columnAutoWidth: true,
					wordWrapEnabled: true,
					showBorders: true,
					editing: {
						mode: "cell",
						allowAdding: function(e){
							if (e.row.data.parent_id == 0){
								return true;
							}
							else {
								return false;
							}
						},
						allowUpdating: true,
						allowDeleting: true,
						useIcons: true
					},
					headerFilter: {
						visible: true
					},
					export: {
						enabled: true
					},
					onExporting: function(e) { 

						var workbook = new ExcelJS.Workbook(); 
						var worksheet = workbook.addWorksheet('Main sheet'); 
						DevExpress.excelExporter.exportDataGrid({ 
							worksheet: worksheet, 
							component: e.component,
							customizeCell: function(options) {
								var excelCell = options;
								excelCell.font = { name: 'Arial', size: 12 };
								excelCell.alignment = { horizontal: 'left' };
							} 
						}).then(function() {
							workbook.xlsx.writeBuffer().then(function(buffer) { 
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Log.xlsx'); 
							}); 
						}); 
						e.cancel = true; 
					},
					dataSource: data['groups'],
					columns: [
						{
							dataField: "group_name",
							caption: "Gate",
							dataType: "string",
						},
						{
							dataField: "camera_id",
							caption: "Camera",
							dataType: "string",
							alignment: "center",
							lookup: {
								dataSource: camera_names,
								displayExpr: "name",
								valueExpr: "id"
							},
						},
					],
					width:500,
					onEditingStart: function(e) {
						if (e.data.parent_id == 0 && e.column.name == 'camera_id'){
							e.cancel = true;
						}
						else if (e.data.parent_id != 0 && e.column.name == 'group_name'){
							e.cancel = true;
						}
					},
					onRowRemoving: function(e) {
						var url;
						var fullData;
						var empty = false;
						if (e.data.parent_id < 1){
							url = '/bk/Group';
							fullData = {
								group_id: e.data.group_id,
							}
						}
						else {
							url = '/bk/CameraGroup';
							fullData = {
								group_id: e.data.group_id,
								camera_id: e.data.camera_id,
							}
						}
						$.ajax({
							url: url,
							type: "DELETE",
							data: fullData,
							error: function (result) {
								alert("There is a Problem, Try Again!");
							},
							success: function (result) {
							}
						});
					},
					onRowUpdating: function(e) {
						var url;
						var fullData;
						var empty = false;
						for (var key in e.newData){
							if (key == 'group_name'){
								if (e.newData[key].trim() == ''){
									empty = true;
								}
							}
							else {
								if (e.newData[key] < 1){
									empty = true;
								}
							}
							if(!empty) {
								if (key == 'group_name'){
									url = '/bk/Group';
									fullData = {
										group_id: e.oldData["group_id"],
										group_name: e.newData[key].trim(),
									}
								}
								else {
									url = '/bk/CameraGroup';
									fullData = {
										group_id: e.oldData["group_id"],
										new_camera_id: e.newData[key],
										old_camera_id: e.oldData[key],
									}
								}
							}
						}
						e.cancel = empty
						if (!empty){
							$.ajax({
								url: url,
								type: "PUT",
								data: fullData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'group_name'){
											alert("Group name is duplicated with other, Try Again!");
										}
										else{
											alert("Camera is duplicated with other in the same group, Try Again!");
										}
										location.reload();
									}
								}
							});
						}
					},
					onRowInserting: function(e) {
						var url;
						var fullData;
						var empty = false;
						if (Object.keys(e.data).length < 2){
							e.cancel = true;
							return;
						}
						for (var key in e.data){
							if (key == 'parent_id') continue;
							if (key == 'group_name'){
								if (e.data[key].trim() == ''){
									empty = true;
								}
							}
							else {
								if (e.data[key] < 1){
									empty = true;
								}
							}
							if(!empty) {
								if (key == 'group_name'){
									url = '/bk/Group';
									fullData = {
										group_name: e.data[key].trim(),
									}
								}
								else {
									url = '/bk/CameraGroup';
									fullData = {
										group_id: group_ids[e.data.parent_id],
										camera_id: e.data[key],
									}
								}
							}
						}
						e.cancel = empty
						if (!empty){
							$.ajax({
								url: url,
								type: "POST",
								data: fullData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'group_name'){
											alert("Group name is duplicated with other, Try Again!");
										}
										else{
											alert("Camera is duplicated with other in the same group, Try Again!");
										}
										location.reload();
									}
									if (url == '/bk/Group'){
										location.reload();
									}
								}
							});
						}
					}
				};
				gridContainer.dxTreeList(gridOptions);
				var grid = gridContainer.data("dxDataGrid");
			}
		});	
    };


};
$(function () {
    SaleViewer.customers = new SaleViewer.Customers();
    SaleViewer.customers.init();
});
