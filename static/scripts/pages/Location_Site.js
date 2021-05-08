"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var companys;
    var self = this,
        currentProductId = 1;

    self.init = function () {
		
		var gridContainer = $("#grid");
		var category = "Location_Site";
		var selectFirst;          
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			error: function (result) {
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				var data = JSON.parse(result)
				companys = data['companys'];
				var gridOptions = {
					keyExpr: "id",
					editing: {
						mode: "popup",
						allowAdding: true,
						allowUpdating: true,
						allowDeleting: true,
						popup: {
							title: "Location/site Info",
							showTitle: true,
							width: 570,
							height: 305,
						},
						useIcons: true
					},
					dataSource: {
						store: data['location_sites']
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
								saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Location_site.xlsx'); 
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
							column: "loc_name",
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
							dataField: "company_id",
							caption: "company",
							groupIndex: 0,
							lookup: {
								dataSource: companys,
								displayExpr: "company_name",
								valueExpr: "company_id"
							}
						},
						{
							dataField: "loc_name",
							caption: "Location Name",
							alignment: "center",
						},
						{
							dataField: "loc_address",
							caption: "Location Address",
							alignment: "center",
						},
						{
							dataField: "loc_ip",
							caption: "Location IP",
							alignment: "center",
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
						if (Object.keys(e.data).length == 5){
							for (var key in newData){
								if (key != 'company_id'){
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
								url: "/bk/Location_Site",
								type: "POST",
								data: newData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'loc_name'){
											alert("This pair of name & company is duplicated with other, Try Again!");
										}
										else{
											alert("This pair of ip & company is duplicated with other, Try Again!");
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
							if (key != 'company_id'){
								if (newData[key].trim() == ''){
									empty = true;
									break;
								}
							}
							fullData[key] = newData[key];
						}
						if (!empty){
							$.ajax({
								url: "/bk/Location_Site",
								type: "PUT",
								data: fullData,
								error: function (result) {
									alert("There is a Problem, Try Again!");
								},
								success: function (result) {
									var data = JSON.parse(result);
									if(data['statusCode'] == '400'){
										if(data['message'] == 'loc_name'){
											alert("This pair of name & company is duplicated with other, Try Again!");
										}
										else{
											alert("This pair of ip & company is duplicated with other, Try Again!");
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
							url: "/bk/Location_Site",
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
