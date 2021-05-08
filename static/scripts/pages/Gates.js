"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var location_sites;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "Gates";
		var selectFirst;          
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				location_sites = data['location_sites'];
				var gridOptions = {
					keyExpr: "id",
					editing: {
						mode: "popup",
						allowAdding: true,
						allowUpdating: true,
						allowDeleting: true,
						popup: {
							title: "Gate Info",
							showTitle: true,
							width: 570,
							height: 305,
						},
						useIcons: true
					},
					dataSource: {
						store: data['gates']
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
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Gates.xlsx'); 
							}); 
						}); 
						e.cancel = true; 
					},
					grouping: {
						autoExpandAll: true,
					},
					groupPanel: {
						visible: true
					},
					summary: {
						totalItems: [{
							column: "name",
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
							dataField: "loc_id",
							caption: "Location/Site",
							groupIndex: 0,
							lookup: {
								dataSource: location_sites,
								displayExpr: "loc_name",
								valueExpr: "loc_id"
							}
						},
						{
							dataField: "name",
							caption: "Gate Name",
							alignment: "center",
						},
						{
							dataField: "details",
							caption: "Gate details",
							alignment: "center",
						},
					],
					showBorders: false,
					columnAutoWidth:false,
					showColumnLines: true,
					showRowLines: false,
					width:700,
					repaintChangesOnly: true,
					onRowInserting: function(e) {
						var newData = e.data;
						var empty = false;
						if (Object.keys(e.data).length == 4){
							for (var key in newData){
								if (key != 'loc_id'){
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
								url: "/bk/Gates",
								type: "POST",
								data: newData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'name'){
											alert("This pair of name & location is duplicated with other, Try Again!");
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
							if (key != 'loc_id'){
								if (newData[key].trim() == ''){
									empty = true;
									break;
								}
							}
							fullData[key] = newData[key];
						}
						if (!empty){
							$.ajax({
								url: "/bk/Gates",
								type: "PUT",
								data: fullData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'loc_name'){
											alert("This pair of name & location is duplicated with other, Try Again!");
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
							url: "/bk/Gates",
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
				if (selectFirst === undefined || selectFirst) grid.selectRows(data['location_sites'][0]);	
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
