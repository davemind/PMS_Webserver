"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var cameras_names;
	var gates_names;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "Group_Camera";
		var selectFirst;          
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				cameras_names = data['cameras'];
				gates_names = data['gates'];
				var gridOptions = {
					keyExpr: "id",
					editing: {
						mode: "popup",
						allowAdding: true,
						allowDeleting: true,
						popup: {
							title: "Group-Camera Info",
							showTitle: true,
							width: 470,
							height: 255,
						},
						useIcons: true
					},
					dataSource: {
						store: data['gate_camera']
					},
					paging: {
						pageSize: 10
					},
					selection: {
						mode: "single"
					},
					filterRow: {
						visible: true
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
							autoFilterEnabled: true,
							customizeCell: function(options) {
								var excelCell = options;
								excelCell.font = { name: 'Arial', size: 12 };
								excelCell.alignment = { horizontal: 'left' };
							} 
						}).then(function() {
							workbook.xlsx.writeBuffer().then(function(buffer) { 
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Group_Camera.xlsx'); 
							}); 
						}); 
						e.cancel = true; 
					},
					summary: {
						totalItems: [{
							column: "agent_id",
							summaryType: "count",
						}]
					},
					grouping: {
						autoExpandAll: true,
					},
					groupPanel: {
						visible: true
					},
					summary: {
						totalItems: [{
							column: "camera_id",
							summaryType: "count",
						}],
						groupItems: [{
							column: "OrderNumber",
							summaryType: "count",
							displayFormat: "{0} cameras",
						}]
					},
					columns: [
						{
							dataField: "gate_id",
							caption: "gate",
							alignment: "center",
							groupIndex: 0,
							lookup: {
								dataSource: gates_names,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
						{
							dataField: "camera_id",
							caption: "camera",
							alignment: "center",
							lookup: {
								dataSource: cameras_names,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
					],
					showBorders: false,
					columnAutoWidth:false,
					showColumnLines: true,
					showRowLines: false,
					width:500,
					repaintChangesOnly: true,
					onRowInserting: function(e) {
						var newData = e.data;
						var empty = false;
						if (Object.keys(e.data).length != 3){
							empty = true;
						}
						if (!empty){
							$.ajax({
								url: "/bk/Group_Camera",
								type: "POST",
								data: newData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'user_name'){
											alert("The name is duplicated with other, Try Again!");
										}
										else{
											alert("The email is duplicated with other, Try Again!");
										}
										location.reload();
									}
								}
							});
						}
						else{
							alert('Some item is empty!');
						}
						e.cancel = empty;
					},
					onRowInserted: function(e) {
						//console.log("RowInserted");
					},
					onRowUpdating: function(e) {
						var newData = e.newData;
						var fullData = e.key;
						var empty = false;
						for (var key in newData){
							fullData[key] = newData[key];
						}
						if (!empty){
							$.ajax({
								url: "/bk/Group_Camera",
								type: "PUT",
								data: fullData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
								}
							});
						}
						e.cancel = empty;
					},
					onRowUpdated: function(e) {
						//console.log("RowUpdated");
					},
					onRowRemoving: function(e) {
						$.ajax({
							url: "/bk/Group_Camera",
							type: "DELETE",
							data: e.data,
							error: function (result) {
								alert("There is a Problem, Try Again!");
								e.cancel = true;
							},
							success: function (result) {
							}
						});
					},
					onRowRemoved: function(e) {
						console.log("RowRemoved");
					},
					onSaving: function(e) {
						console.log("Saving");
					},
				};
				gridContainer.dxDataGrid(gridOptions);
				var grid = gridContainer.data("dxDataGrid");
				if (selectFirst === undefined || selectFirst) grid.selectRows(data['user_permissions'][0]);	
			}
		});	
		$("#autoExpand").dxCheckBox({
			value: true,
			text: "Expand All Groups",
			onValueChanged: function(data) {
				gridContainer.dxDataGrid("instance").option("grouping.autoExpandAll", data.value);
			}
		});
    };
};
$(function () {
    SaleViewer.customers = new SaleViewer.Customers();
    SaleViewer.customers.init();
});
