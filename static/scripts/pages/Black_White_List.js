"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var types, BlackWhitetypes, Locations, agents;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "WhiteList";
		var selectFirst;          

		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				grid.endCustomLoading();
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				types = data['type'];
				BlackWhitetypes = data['BlackWhitetypes'];
				Locations = data['Locations'];
				agents = data['agents'];

				var gridOptions = {
					keyExpr: "id",
					editing: {
						mode: "popup",
						allowAdding: true,
						allowUpdating: true,
						allowDeleting: true,
						popup: {
							title: "Black/White List Info",
							showTitle: true,
							width: 670,
							height: 405,
						},
						useIcons: true
					},
					dataSource: {
						store: data['blacklist_json_data']
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
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'WhiteList.xlsx'); 
							}); 
						}); 
						e.cancel = true; 
					},
					summary: {
						totalItems: [{
							column: "value",
							summaryType: "count",
						}],
						groupItems: [{
							column: "OrderNumber",
							summaryType: "count",
							displayFormat: "{0} items",
						}]
					},
					columns: [
						{
							dataField: "value",
							alignment: "left",
						},
						{
							dataField: "type",
							alignment: "center",
							groupIndex: 1,
							lookup: {
								dataSource: types,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
						{
							dataField: "isBlack",
							caption: 'Black/White',
							alignment: "center",
							groupIndex: 0,
							lookup: {
								dataSource: BlackWhitetypes,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
						{
							dataField: "loc_id",
							caption: 'Location Name',
							alignment: "center",
							lookup: {
								dataSource: Locations,
								displayExpr: "loc_name",
								valueExpr: "loc_id"
							}
						},
						{
							dataField: "effective_date",
							dataType: "datetime",
							format: "dd/MM/yy",
							alignment: "center",
						},
						{
							dataField: "approve_date",
							dataType: "datetime",
							format: "dd/MM/yy",
							alignment: "center",
						},
						{
							dataField: "approved_by",
							alignment: "center",
							lookup: {
								dataSource: agents,
								displayExpr: "name",
								valueExpr: "id"
							}
						},
					],
					showBorders: false,
					columnAutoWidth:false,
					showColumnLines: true,
					showRowLines: false,
					//width:500,
					repaintChangesOnly: true,
					onRowInserting: function(e) {
						var newData = e.data;
						var empty = false;
						if (Object.keys(e.data).length == 8){
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
								url: "/bk/WhiteList",
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
								url: "/bk/WhiteList",
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
							url: "/bk/WhiteList",
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
				if (selectFirst === undefined || selectFirst) grid.selectRows(data['blacklist_json_data'][0]);	
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
