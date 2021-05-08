"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var genders = [{
		"id": 0,
		"val": "Male"
	}, {
		"id": 1,
		"val": "Female"
	}];
    var self = this,
        currentProductId = 1,
        gridOptions = {
			keyExpr: "id",
			editing: {
				mode: "row",
				allowUpdating: true,
				allowDeleting: true,
				useIcons: true
			},
            dataSource: {
                store: []
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
						saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Driver.xlsx'); 
					}); 
				}); 
				e.cancel = true; 
			},
            paging: {
                pageSize: 3
            },
            selection: {
                mode: "single"
            },
			filterRow: {
                visible: true
            },
			columnAutoWidth:true,
            showColumnLines: false,
			summary: {
				totalItems: [{
					column: "first_name",
					summaryType: "count",
				}]
			},
            columns: [
                {
                    dataField: "first_name",
                    dataType: "string",
					alignment: "left"
                },
                {
                    dataField: "last_name",
                    dataType: "string"
                  },
                {
                    dataField: "expiry_date",
                    dataType: "date",
					format: "dd/MM/yyyy",
                    alignment: "left",
					allowEditing: false
                },
                {
                    dataField: "driver_number",
                    dataType: "string",
                    alignment: "left"
                },
                {
                    dataField: "province",
                    dataType: "string",
                    alignment: "left"
                },
				{
                    dataField: "DOB",
                    dataType: "date",
					format: "dd/MM/yyyy",
                    alignment: "left"
                },
				{
                    dataField: "sex",
                    caption: "Sex",
                    alignment: "left",
					lookup: {
						dataSource: genders,
						displayExpr: "val",
						valueExpr: "id"
					}	
                }
			
			],
			repaintChangesOnly: true,
			onRowUpdating: function(e) {
				var newData = e.newData;
				var fullData = e.key;
				var empty = false;
				for (var key in newData){
					if (newData[key].trim() == ''){
						empty = true;
						alert('Some item is empty!');
						break;
					}
					fullData[key] = newData[key];
				}
				if (!empty){
					$.ajax({
						url: "/bk/Driver",
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
			onRowRemoving: function(e) {
				$.ajax({
					url: "/bk/Driver",
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
            onSelectionChanged: function (selectedItems) {
                if (selectedItems.selectedRowKeys.length) {
					var data = selectedItems.selectedRowKeys[0];
                    if(data)
					{
						//$(".DriverInfo").text("Name: " + data.first_name + " " + data.last_name);
						//$(".DriverPhoto").attr("src", data.face_path);
						self.changeProfile(selectedItems.selectedRowKeys[0]);
					}
                }
            },
            showRowLines: false
        };

        
        
    self.changeProfile = function(data) {
		
			$("#form").dxForm({
				colCount: 2,
				formData: data,
				items: [ {
						itemType: "group",
						cssClass: "first-group",
						colCount: 3,
						items: [{
									dataField: "face_path",
									template: function (data) {
										return "<img class='form-avatar' src='" + data.editorOptions.value + "'>";
									},
									editorOptions: {
										disabled: true
									},
									label: { 
												visible: "false",
												alignment: "right" // or "left" | "center"
											}
								}, {
									itemType: "group",
									colSpan: 2,
									items: [{
										dataField:"first_name",
										label: { 
												caption: "Date of Birth",
												location: "left",
												alignment: "right" // or "left" | "center"
											}
									}, {
										dataField: "last_name",
										label: { 
											caption: "Date of Birth",
											location: "left",
											alignment: "right" // or "left" | "center"
										}
									},{
										dataField: "DOB",
										editorType: "dxDateBox",
										label: { 
											caption: "Date of Birth",
											location: "left",
											alignment: "right" // or "left" | "center"
										}
									}]
								}]
						},	{
						itemType: "group",
						cssClass: "second-group",
						colCount: 1,
						items: [{
									dataField: "province",
									editorOptions: {
										disabled: false
									}, label: { 
										location: "left",
										alignment: "right" // or "left" | "center"
									}
								}, {
									dataField: "driver_number",
									editorOptions: {
										disabled: false
									}, label: { 
										location: "left",
										alignment: "right" // or "left" | "center"
									}
								}, {
									dataField: "expiry_date",
									editorType: "dxDateBox",
									label: { 
										location: "left",
										alignment: "right" // or "left" | "center"
									}
						}]
				}]
			});

    };


    self.init = function () {
		
		var gridContainer = $("#grid");
        gridContainer.dxDataGrid(gridOptions);
        var grid = gridContainer.data("dxDataGrid");
        var dataSource = gridOptions.dataSource;
		var loadOptions = {};
		var category = "Driver";
		var selectFirst;          
		grid.beginCustomLoading();
		
		$.ajax({
			url: SaleViewer.baseApiUrl + category,
			data: loadOptions,
			error: function (result) {
				grid.endCustomLoading();
				alert("There is a Problem, Try Again!");			
			},
			success: function (result) {
				grid.option("dataSource", { store: JSON.parse(result)});
				grid.endCustomLoading();
				if (selectFirst === undefined || selectFirst) grid.selectRows(dataSource.store[0]);	
			}
		});	
    };


};
$(function () {
    SaleViewer.customers = new SaleViewer.Customers();
    SaleViewer.customers.init();
	
	
});
