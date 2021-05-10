"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	

    var self = this,
		popup = null,
        gridOptions = {
			keyExpr: "id",
			editing: {
				mode: "row",
				allowAdding: true,
				allowUpdating: true,
				allowDeleting: true,
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
						saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Camera.xlsx'); 
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
                    dataField: "name",
					alignment: "left",
                },
                {
                    dataField: "url",
                    alignment: "center",
                },{
					type: "buttons",
					width: 100, 
					buttons: ["edit", "delete", {
						hint: "Check",
						icon: "video",
						visible: true,
						onClick: function(e) {
							video_data = e.row.data;
							$("#video_img").attr("src", "");
							self.showVideo(video_data);
						},
						onHidden: function(e) {
							$("#video_img").attr("src", "");
						}
					}]
				}
 			],
			showBorders: false,
			columnAutoWidth:false,
            showColumnLines: true,
            showRowLines: false,
			hoverStateEnabled: true,
			width:500,
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
						url: "/bk/Camera",
						type: "POST",
						data: newData,
						error: function (result) {
							alert("There is a Problem, Try Again!");
						},
						success: function (result) {
							var data = JSON.parse(result);
							if(data['statusCode'] == '400'){
								if(data['message'] == 'camera_name'){
									alert("The name is duplicated with other, Try Again!");
								}
								else if(data['message'] == 'camera_url'){
									alert("The url is duplicated with other, Try Again!");
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
						url: "/bk/Camera",
						type: "PUT",
						data: fullData,
						error: function (result) {
							alert("There is a Problem, Try Again!");
						},
						success: function (result) {
							var data = JSON.parse(result);
							if(data['statusCode'] == '400'){
								if(data['message'] == 'camera_name'){
									alert("The name is duplicated with other, Try Again!");
								}
								else if(data['message'] == 'camera_url'){
									alert("The url is duplicated with other, Try Again!");
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
					url: "/bk/Camera",
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
				//console.log("RowRemoved");
			},
			onSaving: function(e) {
				//console.log("Saving");
			},
        },
		video_data=null,
		popupOptions = {
            width: 600,
            height: 480,
            contentTemplate: function() {
                return $("<div/>").append(
					$("<p>" + video_data.name + "</p>"),
                    $("<img id='video_img' width='480' height='270' autoplay='autoplay' style='margin: 3px;' src=/video_feed1?url=" + video_data.url + " />")
                );
            },
            showTitle: true,
            title: "Live Video",
            visible: false,
            dragEnabled: false,
            closeOnOutsideClick: true
		};

    self.init = function () {
		
		var gridContainer = $("#grid");
        gridContainer.dxDataGrid(gridOptions);
        var grid = gridContainer.data("dxDataGrid");
		var loadOptions = {};
		var category = "Camera";
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
				var res = JSON.parse(result);
				grid.option("dataSource", { store: res});
				grid.endCustomLoading();
			}
		});	
    };
	self.showVideo = function(data) {
        if(popup) {
            popup.option("contentTemplate", popupOptions.contentTemplate.bind(this));
        } else {
            popup = $("#video_popup").dxPopup(popupOptions).dxPopup("instance");
        }

        popup.show();
    };
        
   
};
$(function () {
    SaleViewer.customers = new SaleViewer.Customers();
    SaleViewer.customers.init();
});
