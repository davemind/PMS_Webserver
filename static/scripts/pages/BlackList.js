"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.Customers = function () {
	
	var url = "/bk/Driver/";
   // let customStore = new DevExpress.data.CustomStore({  
//		key: "Id"  
//	}  
	var types = [{
		"ID": 0,
		"Name": "tractor"
	}, {
		"ID": 1,
		"Name": "driver"
	}, {
		"ID": 2,
		"Name": "company"
	}];
    var self = this,
        currentProductId = 1,
        gridOptions = {
			keyExpr: "id",
			editing: {
				mode: "popup",
				allowAdding: true,
				allowUpdating: true,
				allowDeleting: true,
				popup: {
					title: "WhiteList Info",
					showTitle: true,
					width: 470,
					height: 255,
				},
				useIcons: true
			},
            dataSource: {
                store: []
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
            columns: [
                {
                    dataField: "value",
					alignment: "left",
                },
                {
                    dataField: "type",
                    alignment: "center",
					lookup: {
						dataSource: types,
						displayExpr: "Name",
						valueExpr: "ID"
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
						url: "/bk/BlackList",
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
						url: "/bk/BlackList",
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
					url: "/bk/BlackList",
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

    self.init = function () {
		
		var gridContainer = $("#grid");
        gridContainer.dxDataGrid(gridOptions);
        var grid = gridContainer.data("dxDataGrid");
        var dataSource = gridOptions.dataSource;
		var loadOptions = {};
		var category = "BlackList";
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
