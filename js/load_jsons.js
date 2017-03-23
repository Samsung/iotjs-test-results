var g_testruns = [];
var g_page_step = 10;

$(document).ready(function() {
	// $.ajaxSetup({ cache: false });
	change_device("stm32");
});

function change_device(device) {
	console.log(device);
	$('#navbar li').removeClass('active');
	$('#show-' + device).addClass('active');
	$('#css-dynamic').attr('href', 'css/device_' + device + '.css');
	clear();
	set_info(device);
	fetch_data(device);
}

function clear() {
	$(".pagination").empty();
	$("#testruns").empty();
	$("#loading").show();
}

function set_info(device) {
	switch (device) {
		case "stm32":
			$("#info-device")
				.attr('href', "http://www.st.com/en/evaluation-tools/stm32f4discovery.html")
				.text("STM32F4-Discovery");
			$("#info-platform")
				.attr('href', "http://nuttx.org/")
				.text("NuttX");
			$("#info-image").attr('src', "img/stm32f4_discovery.jpg");
			break;
		case "rpi2":
			$("#info-device")
				.attr('href', "https://www.raspberrypi.org/products/raspberry-pi-2-model-b/")
				.text("Raspberry Pi 2 Model B");
			$("#info-platform")
				.attr('href', "https://www.raspbian.org/")
				.text("Raspbian Jessie");
			$("#info-image").attr('src', "img/raspberrypi2.jpg");
			break;
	}
}

function fetch_data(device) {
	g_testruns = []

	$.getJSON("data/" + device + "/index.json")
	.done(function(index_json) {
		var pending_dl = index_json.length;
		render_pagination(index_json.length, g_page_step);
		$.each(index_json, function(key, val) {
			$.getJSON("data/" + device + "/" + val)
			.done(function(entry_json) {
				g_testruns.push(entry_json);
			})
			.fail(function(jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log("Request failed: " + err);
			})
			.always(function(){
				pending_dl--;
				if (pending_dl == 0) {
					g_testruns.sort(function(a, b){
						var a_date = new Date(a.date);
						var b_date = new Date(b.date);
						return (a_date < b_date) ? 1 : ((a_date > b_date) ? -1 : 0);
					});
					$(g_testruns).each(function(idx, testrun){
						testrun.tests.sort(function(a, b){
							return (a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0);
						});

						// array to map
						testrun.tests_map = {};
						$(testrun.tests).each(function(test_idx, test){
							testrun.tests_map[test.name] = {
								result: test.result,
								output: test.hasOwnProperty("output") ? test.output : "",
								reason: test.hasOwnProperty("reason") ? test.reason : "",
								memory: test.hasOwnProperty("memory") ? test.memory : "",
							};
						});
					});
					render_testruns(g_testruns, 0, g_page_step);
				}
			});
		});
	})
	.fail(function(jqxhr, textStatus, error) {
		var err = textStatus + ", " + error;
		alert("Request Failed: " + err);
		return;
	});
}
