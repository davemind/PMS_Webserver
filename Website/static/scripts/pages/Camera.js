"use strict";

window.SaleViewer = window.SaleViewer || {};

$(function () {
	var zoneGridOptions = {
		keyExpr: "id",
		editing: {
			mode: "popup",
			allowAdding: true,
			allowUpdating: true,
			allowDeleting: true,
			popup: {
				title: "Zone Info",
				showTitle: true,
				width: 370,
				height: 205,
			},
			form: {
				colCount: 1,
				items: [
					{
						dataField: "name",
						caption: "Zone Name",
						validationRules: [{
							type: "required",
							message: "Zone Name is required"
						}]
					},
				],
			},
			useIcons: true
		},
		dataSource: {
			store: new Array()
		},
		paging: {
			enabled:false
		},
		selection: {
			enabled: false
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
					saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Zone.xlsx'); 
				}); 
			}); 
			e.cancel = true; 
		},
		summary: {
			totalItems: [{
				column: "name",
				summaryType: "count",
			}]
		},
		columns: [
			{
				dataField: "id",
				caption: "ID",
				alignment: "left",
				width: "20%",
				editing: false
			},
			{
				dataField: "name",
				caption: "Zone Name",
				validationRules: [{
					type: "required",
					message: "Zone Name is required"
				}]
			},
		],
		showBorders: false,
		//columnAutoWidth: false,
		showColumnLines: true,
		showRowLines: false,
		hoverStateEnabled: true,
		onRowInserting: function(e) {
			var newData = e.data;
			$.ajax({
				url: "/bk/Zone",
				type: "POST",
				data: newData,
				error: function (result) {
					alert("There is a Problem, Try Again!");
				},
				success: function (result) {
					var data = JSON.parse(result);
					if(data['statusCode'] == '400'){
						if(data['message'] == 'zone_name'){
							alert("The name is duplicated with other, Try Again!");
						}
					}
					location.reload();
				}
			});
		},
		onRowUpdating: function(e) {
			var newData = e.newData;
			var fullData = e.key;
			for (var key in newData){
				fullData[key] = newData[key];
			}
			$.ajax({
				url: "/bk/Zone",
				type: "PUT",
				data: fullData,
				error: function (result) {
					alert("There is a Problem, Try Again!");
				},
				success: function (result) {
					var data = JSON.parse(result);
					if(data['statusCode'] == '400'){
						if(data['message'] == 'zone_name'){
							alert("The name is duplicated with other, Try Again!");
						}
						location.reload();
					}
				}
			});
		},
		onRowRemoving: function(e) {
			$.ajax({
				url: "/bk/Zone",
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
	};
	var ZoneGrid = $("#Zone").dxDataGrid(zoneGridOptions).dxDataGrid("instance")
	
	ZoneGrid.beginCustomLoading();
	$.ajax({
		url: '/bk/Camera',
		data: {},
		error: function (result) {
			alert("There is a Problem, Try Again!");
			ZoneGrid.endCustomLoading();
		},
		success: function (result) {
			result = JSON.parse(result);
			ZoneGrid.option("dataSource", { store: result['zones']});
			ZoneGrid.endCustomLoading();
		}
	});	
});
