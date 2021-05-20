"use strict";

window.IVMS = window.IVMS || {};

window.jsPDF = window.jspdf.jsPDF;
applyPlugin(window.jsPDF);

IVMS.Videos = function () {
	var $t_fixed;
	var positionFlag = false;
	function PatchHeaders(e) {
		var $header = e.element.find(".dx-datagrid-headers").detach();
		var $panel = e.element.find(".dx-datagrid-header-panel").detach();
		$t_fixed = $("<div>");
		$t_fixed.append($panel);
		$t_fixed.append($header);
		$t_fixed.addClass("fixed-headers").prependTo(e.element.find(".dx-datagrid")[0]);
		if (positionFlag)
			$t_fixed.css("position", "fixed");
		$t_fixed.width(e.element.width());
	}
    var self = this,
		popup = null,
        gridOptions = {
			editing: {
				mode: "row",
				allowAdding: false,
				allowUpdating: false,
				allowDeleting: true,
				useIcons: true
			},
            dataSource: {
                store: new Array()
            },
			paging: {
                pageSize: 10
            },
			pager: {
				showPageSizeSelector: true,
				allowedPageSizes: [10, 20, 30, 40, 50, "all"],
				showInfo: true,
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
			summary: {
				totalItems: [{
                    column: "thumb_name",
					summaryType: "count",
				}],				
				groupItems: [{
					column: "OrderNumber",
					summaryType: "count",
					displayFormat: "{0} transactions",
				}]
			},
            columns: [
                {
                    dataField: "id",
                    caption: "ID",
					alignment: "center",
					width: 80,
                }, {
                    dataField: "thumb_name",
					caption: "Video Thumb",
                    alignment: "center",
					
					allowFiltering: false,
					allowSorting: false,
					cellTemplate: function (container, options) {
						$("<div>")
							.append($("<img>", { "src": "/static" + options.value }))
							.appendTo(container);
					}
                },
                {
                    dataField: "start_time",
					caption: "Start Time",
                    dataType: "datetime",
					format: "dd/MM/yy HH:mm",
                }, {
                    dataField: "end_time",
                    alignment: "center",
					dataType: "datetime",
					format: "dd/MM/yy HH:mm",
                },
				{
					dataField: "camera_name",
					caption: "Camera Name",
				},
				{
					dataField: "location",
					caption: "Camera Location",
				},
                {
					type: "buttons",
					width: 100, 
					buttons: ["delete", {
						hint: "Check",
						icon: "video",
						visible: true,
						onClick: function(e) {
							video_data = e.row.data;

							self.showVideo(video_data);
						},
						onHidden: function(e) {
							$("#video_img").attr("src", "");
						}
					}]
				},
 			],
			grouping: {
				autoExpandAll: true,
			},
			groupPanel: {
				visible: true
			},
			showBorders: false,
			columnAutoWidth:false,
            showColumnLines: true,
            showRowLines: false,
			hoverStateEnabled: true,			
			onRowRemoving: function(e) {
				$.ajax({
                    url: "/bk/Video",
					type: "DELETE",
					data: {"id":e.data.id},
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
			onContentReady: function (e) {
				PatchHeaders(e);
				var el = e.component.element().find('.dx-page-size').last();  
					el.click(function(){  
					e.component.pageSize(0);  
				});
            }
        },
		 
		video_data=null,
		popupOptions = {
            width: 600,
            height: 580,
            contentTemplate: function() {
                return $("<div/>").append(
					$("<p>" + video_data.video_filename + "</p>"),
                    $("<video id='video_img' width='480' height='360' controls='controls' autoplay='' style='margin: 3px;' src=/static" + video_data.video_filename + "> </video>"),
					$("<a id='download' href='' download=''></a>"),
                );
            },
            showTitle: true,
            title: "Saved Video",
            visible: false,
            dragEnabled: false,
            closeOnOutsideClick: true,
			onHidden: function (e) {
				$("#video_img").attr("src", "");
			},
			toolbarItems: [{
				widget: "dxButton",
				location: "after",
				options: { 
					icon: 'download',
					onClick: function(e) { 
						var filePath = "http://localhost:5000" + $("#video_img").attr("src");
						var splits = filePath.split('/');
						$("#download").attr("href", filePath)
						$("#download").attr("download", splits[splits.length-1])
						document.getElementById('download').click();
					}
				}
			}]
	};

    self.init = function () {
		$('#exportPdfButton').dxButton({
			icon: 'static/images/icons/pdf1.png',
			text: 'Export to PDF',
			onClick: function() {
			  const doc = new jsPDF();
			  DevExpress.pdfExporter.exportDataGrid({
				jsPDFDocument: doc,
				component: gridContainer.dxDataGrid('instance')
			  }).then(function() {
				doc.save('Videos.pdf');
			  });
			}
		});
		$('#exportxlsxButton').dxButton({
			icon: 'static/images/icons/excel1.png',
			text: 'Export to xlsx',
			onClick: function() {
				var workbook = new ExcelJS.Workbook(); 
				var worksheet = workbook.addWorksheet('Main sheet'); 
				DevExpress.excelExporter.exportDataGrid({ 
					worksheet: worksheet, 
					component: gridContainer.dxDataGrid('instance'),
					autoFilterEnabled: true,
					customizeCell: function(options) {
						var excelCell = options;
						excelCell.font = { name: 'Arial', size: 12 };
						excelCell.alignment = { horizontal: 'left' };
					} 
				}).then(function() {
					workbook.xlsx.writeBuffer().then(function(buffer) { 
						saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Videos.xlsx'); 
					}); 
				}); 
			}
		});
		
		var menuSettings = [
			{ id: 1, name: "Today"},
			{ id: 2, name: "This Week"},
			{ id: 3, name: "This Month"},
			{ id: 4, name: "This Year"},
			{ id: 5, name: "All"},
		];
		$("#Timeline").dxDropDownButton({
			items: menuSettings,
			onItemClick: function(e) {
				grid.option("dataSource", { store: []});
				grid.beginCustomLoading();
				$.ajax({
					url: "/bk/Video",
					data: {'timeline': e.itemData.name},
					error: function (result) {
						grid.endCustomLoading();
						alert("There is a Problem, Try Again!");			
					},
					success: function (result) {
						result = JSON.parse(result)
						grid.option("dataSource", { store: result});
						grid.endCustomLoading();
						if (selectFirst === undefined || selectFirst) grid.selectRows(dataSource.store[0]);	
					}
				});	
			},
			displayExpr: "name",
			keyExpr: "id",
			useSelectMode: true,
			selectedItemKey: 1,
			width: 150,
		});
		
		var gridContainer = $("#grid");
        gridContainer.dxDataGrid(gridOptions);
        var grid = gridContainer.data("dxDataGrid");
		var loadOptions = {};
		var selectFirst;          
		grid.beginCustomLoading();
		
		$.ajax({
            url: "/bk/Video",
			data: {'timeline': "Today"},
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
    IVMS.Videos = new IVMS.Videos();
    IVMS.Videos.init();
});