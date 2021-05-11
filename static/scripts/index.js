"use strict";

window.SaleViewer = window.SaleViewer || {};

SaleViewer.loadData = function (data, callback, category) {
    $.ajax({
        url: SaleViewer.baseApiUrl + category,
        data: data,
        success: callback
    });
};

SaleViewer.lightColor = "#808080";
SaleViewer.darkColor = "#252525";

$(function () {
    DevExpress.viz.registerPalette("SaleViewPalette", {
        simpleSet: ["#da5859", "#f09777", "#fbc987", "#a5d7d0", "#a5bdd7", "#e97c82"],
        indicatingSet: ['#90ba58', '#eeba69', '#a37182'],
        gradientSet: ['#78b6d9', '#eeba69']
    });

});

function myTimer() {
	$.ajax({
		url: '/bk/GetNewAlarmNumber',
		error: function (result) {
		},
		success: function (result) {
			if (result == "0") {
				var alarm_circle = document.getElementById("alarm_circle");
				alarm_circle.setAttribute("class", "fa fa-circle noti_none");
				$(".num").text("");
			}
			else {
				var alarm_circle = document.getElementById("alarm_circle");
				alarm_circle.setAttribute("class", "fa fa-circle noti_show");
				$(".num").text(result);
			}
		}
	});
}

var myVar = setInterval(function () { myTimer() }, 5000);
