"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var user_names;
	var group_names;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "Permission";
		var selectFirst;          
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				user_names = data['users'];
				group_names = data['groups'];
				var gridOptions = {
					keyExpr: "id",
					editing: {
						mode: "popup",
						allowAdding: true,
						allowDeleting: true,
						popup: {
							title: "Permission Info",
							showTitle: true,
							width: 470,
							height: 255,
						},
						useIcons: true
					},
					dataSource: {
						store: data['user_permissions']
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
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Permission.xlsx'); 
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
							column: "gate_id",
							summaryType: "count",
						}],
						groupItems: [{
							column: "OrderNumber",
							summaryType: "count",
							displayFormat: "{0} gates",
						}]
					},
					columns: [
						{
							dataField: "agent_id",
							caption: "agent",
							alignment: "center",
							groupIndex: 0,
							lookup: {
								dataSource: user_names,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
						{
							dataField: "gate_id",
							caption: "gate",
							alignment: "center",
							lookup: {
								dataSource: group_names,
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
						if (Object.keys(e.data).length == 3){
							for (var key in newData){
								if (key == 'value'){
									if (newData[key].trim() == ''){
										empty = true;
										break;
									}
								}
							}
						}
						else{
							empty = true;
						}
						if (!empty){
							$.ajax({
								url: "/bk/Permission",
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
								if (key == 'value'){
									if (newData[key].trim() == ''){
										empty = true;
										break;
									}
								}
							fullData[key] = newData[key];
						}
						if (!empty){
							$.ajax({
								url: "/bk/Permission",
								type: "PUT",
								data: fullData,
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
						e.cancel = empty;
					},
					onRowUpdated: function(e) {
						//console.log("RowUpdated");
					},
					onRowRemoving: function(e) {
						$.ajax({
							url: "/bk/Permission",
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
