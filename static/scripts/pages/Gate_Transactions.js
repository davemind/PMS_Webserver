"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var popup = $("#img_popup").dxPopover({
		width: 107,
		height: 80,
		minHeight: 75,
		showTitle:false
	}).dxPopover("instance"); 
	
	var conf_hover = $("#conf_hover").dxPopover({
		width: 110,
		height: 30,
		minHeight: 25,
		showTitle:false
	}).dxPopover("instance"); 
	
    var self = this,
        currentProductId = 1,
        gridOptions = {
			keyExpr: "id",
            dataSource: {
                store: []
            },
            paging: {
                pageSize: 30
            },
			pager: {
				showPageSizeSelector: true,
				allowedPageSizes: [15, 30],
				showInfo: true
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
						saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Gate_Transactions.xlsx'); 
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
			columnAutoWidth:false,
            showColumnLines: false,
			showBorders: true,
			hoverStateEnabled: true,
			cellHintEnabled:true,
			editing: {
				mode: "cell",
				allowUpdating: true
			},
            columns: [
                {
                    dataField: "trans_start",
					caption:"Tran Start",
                    dataType: "datetime",
					format: "dd/MM/yy HH:mm",
					alignment: "left",
					allowEditing: false
                },
                {
                    dataField: "tractor_lpr",
                    dataType: "string",
					cellTemplate: function (container, options) {
						self.changeColor(container, options.data.tractor_conf);
						container.html(options.data.tractor_lpr);
						
					}	
					
                  },
                {
                    dataField: "tractor_num",
                    dataType: "string",
					cellTemplate: function (container, options) {
						self.changeColor(container, options.data.tractor_num_conf);
						container.html(options.data.tractor_num);
						
					}
                },
                {
                    dataField: "company",
                    dataType: "string",
                    alignment: "left"
                },
                {
                    dataField: "trailer_lpr",
                    dataType: "string",
                    alignment: "left",
					cellTemplate: function (container, options) {
						self.changeColor(container, options.data.trailer_conf);
						container.html(options.data.trailer_lpr);
						
					}
                },
				{
                    dataField: "container_num",
                    dataType: "string",
					cellTemplate: function (container, options) {
						self.changeColor(container, options.data.container_conf);
						container.html(options.data.container_num);
						
					}
                },
				{
                    dataField: "driver_id",
					caption: "Driver Number",
                    dataType: "number",
					allowEditing: false
                },
				{
                    dataField: "clear",
                    dataType: "boolean"
                },
				{
                    dataField: "seal_num",
                    dataType: "string"
                },
				{
                    dataField: "trans_end",
					caption: "Tran End",
                    dataType: "datetime",
					format: "dd/MM/yy HH:mm",
					allowEditing: false
                },
				{
                    dataField: "remarks",
                    dataType: "string"
                },
				{
					dataField: "gate_id",
					caption: "Gate",
					groupIndex: 1
				},
				{
					dataField: "agent_id",
					caption: "Agent",
					groupIndex: 0
				}
			],
			summary: {
				totalItems: [{
					column: "trans_start",
					summaryType: "count",
				}],
				groupItems: [{
					column: "OrderNumber",
					summaryType: "count",
					displayFormat: "{0} transactions",
				}]
			},
			onCellHoverChanged: function(e) {
				if(e.eventType == "mouseover" && e.data != undefined)
				{
					if (e.column.dataField == "tractor_lpr") {
						self.showImg(e.data.tractor_img, e.cellElement, e.data.tractor_conf);
					}
					else if (e.column.dataField == "trailer_lpr") {
						self.showImg(e.data.trailer_img, e.cellElement, e.data.trailer_conf);
					}
					else if (e.column.dataField == "tractor_num") {
						conf_hover.option("contentTemplate",
							function(contentElement) {
							  $("<div/>")
								  .append("confidence=" + e.data.tractor_num_conf)
								  .appendTo(contentElement);         
						});
						conf_hover.option("target", e.cellElement);
						conf_hover.show();
						popup.hide();
					}
					else if (e.column.dataField == "company") {
						conf_hover.option("contentTemplate",
							function(contentElement) {
							  $("<div/>")
								  .append("confidence=" + e.data.company_conf)
								  .appendTo(contentElement);         
						});
						conf_hover.option("target", e.cellElement);
						conf_hover.show();
						popup.hide();
					}
					else if (e.column.dataField == "container_num") {
						conf_hover.option("contentTemplate",
							function(contentElement) {
							  $("<div/>")
								  .append("confidence=" + e.data.container_conf)
								  .appendTo(contentElement);         
						});
						conf_hover.option("target", e.cellElement);
						conf_hover.show();
						popup.hide();
					}
					else{
						popup.hide();
						conf_hover.hide();
					}
				}	
				else{
					popup.hide();
					conf_hover.hide();
				}
		    },
			onRowUpdating: function(e) {
				var newData = e.newData;
				var fullData = e.key;
				var field;
				var value;
				var log_id;
				var empty = false;
				for (var key in newData){
					if(key != 'clear'){
						if (newData[key].trim() == ''){
							empty = true;
							alert('Some item is empty!');
							break;
						}
					}
					field = key;
					value = newData[key];
					log_id = fullData['id'];
					break;
				}
				if (!empty){
					$.ajax({
						url: "/bk/Log",
						type: "PUT",
						data: {
							field: field,
							value: value,
							log_id: log_id,
						},
						error: function (result) {
							alert("There is a Problem, Try Again!");
						},
						success: function (result) {
						}
					});
				}
				e.cancel = empty;
			},

            onSelectionChanged: function (selectedItems) {
                if (selectedItems.selectedRowKeys.length) {
					var data = selectedItems.selectedRowKeys[0];
                    if(data)
					{
						
						//self.changeProfile(selectedItems.selectedRowKeys[0]);
					}
                }
            },
            showRowLines: false
        };
	self.showImg = function(src_path, target, conf)
	{
		popup.option("contentTemplate",
						function(contentElement) {
							$('<img/>', {
								src: src_path,
								width: '96px',
								height: '46px'
							}).appendTo(contentElement); 
						$("<div/>")
						  .append("confidence=" + conf)
						  .appendTo(contentElement);							
					});
		popup.option("target", target);
		popup.show();
		
	}
    self.changeColor = function(container, val)
	{
		if(val > 90)
		{
			container.addClass("greenFont");
		}
		else if(val > 80)
		{
			container.addClass("blueFont");
		}
		else if(val > 70)
		{
			container.addClass("yellowFont");
		}
		else if(val > 50)
		{
			container.addClass("orangeFont");
		}
		else {
			container.addClass("redFont");
		}
	};    
        
    self.changeProfile = function(data) {
		
			$("#form").dxForm({
				colCount: 2,
				formData: data,
				items: [ {
						itemType: "group",
						cssClass: "first-group",
						colCount: 4,
						items: [{
									dataField: "face_path",
									caption: "Face",
									template: function (data) {
										return "<img class='form-avatar' src='" + data.editorOptions.value + "'>";
									},
									editorOptions: {
										disabled: true
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
									editorOptions: {
										
										width: "50%"
									}
									, label: { 
										location: "left",
										alignment: "right" // or "left" | "center"
									}
						}]
				}]
			});

    };


    self.init = function () {
		
		var gridContainer = $("#grid");
        var dataGrid = gridContainer.dxDataGrid(gridOptions).dxDataGrid("instance");
        var grid = gridContainer.data("dxDataGrid");
        var dataSource = gridOptions.dataSource;
		var loadOptions = {};
		var category = "Log";
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
		$("#autoExpand").dxCheckBox({
			value: true,
			text: "Expand All Groups",
			onValueChanged: function(data) {
				dataGrid.option("grouping.autoExpandAll", data.value);
			}
		});
    };


};
$(function () {
    SaleViewer.customers = new SaleViewer.Customers();
    SaleViewer.customers.init();
	
	
});
