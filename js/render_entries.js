var c_one_day_ms = 1000 * 60 * 60 * 24;

function hide_loading() {
	$("#loading").hide();
}

function render_testrun(uid, testrun, earlier_testrun) {
	var passed = 0;
	var skipped = 0;
	var failed = 0;
	$.each(testrun.tests, function(name, test_info) {
		if (test_info.result == "pass")
			passed++;
		else if (test_info.result == "skip")
			skipped++;
		else
			failed++;
	});

	var raw_html = '<div id="' + uid + '" class="testrun ';
	if (failed > 0)
		raw_html += 'fail';
	else
		raw_html += 'pass';
	raw_html += '">';

	raw_html += '<div class="morebtn"><i class="fa fa-angle-down fa-fw" aria-hidden="true"></i></div>';
	raw_html += '<div class="date">' + testrun.date.substr(0, 10) + '</div>';

	raw_html += '<div class="preview">';

		raw_html += _render_summary(passed, failed, skipped);
		raw_html += _render_binary(testrun.bin);
		raw_html += _render_submodules(testrun.submodules);

	raw_html += '</div>'; // top-div
	raw_html += '<div>';

		raw_html += _render_tests_table(uid, testrun.tests, earlier_testrun.tests_map);

	raw_html += '</div>'; // bottom-div
	raw_html += '</div>';
	return raw_html;
}

function _render_summary(passed, failed, skipped) {
	var raw_html = '<ul class="numresults">';
	raw_html += '<li class="pass" title="Passed"><i class="fa fa-check fa-fw" aria-hidden="true"></i>' + passed + '</li>';
	raw_html += '<li class="fail" title="Failed"><i class="fa fa-times fa-fw" aria-hidden="true"></i>' + failed + '</li>';
	raw_html += '<li class="skip" title="Skipped"><i class="fa fa-step-forward fa-fw" aria-hidden="true"></i>' + skipped + '</li>';
	raw_html += '</ul>';
	return raw_html;
}

function _render_binary(binary) {
	function isInt(value) {
		return parseInt(Number(value)) == value;
	}

	var raw_html = '<div class="binary"><table>';
	raw_html += '<tr><td class="sumlabel" title="Total binary size">binary</td><td class="mono">'
		+ binary.total + (isInt(binary.total) ? ' B' : '') + '</td></tr>';
	raw_html += '<tr><td>text</td><td class="mono">' + binary.text + (isInt(binary.text) ? ' B' : '') + '</td></tr>';
	raw_html += '<tr><td>bss</td><td class="mono">' + binary.bss + (isInt(binary.bss) ? ' B' : '') + '</td></tr>';
	raw_html += '<tr><td>data</td><td class="mono">' + binary.data + (isInt(binary.data) ? ' B' : '') + '</td></tr>';
	raw_html += '<tr><td>rodata</td><td class="mono">' + binary.rodata + (isInt(binary.rodata) ? ' B' : '') + '</td></tr>';
	raw_html += '</table></div>';
	return raw_html;
}

var g_submod_nice_name = {
	"iotjs": "IoT.js",
	"jerryscript": "JerryScript",
	"nuttx": "NuttX",
	"apps": "NuttX Apps"
};
var g_submod_baseurl = {
	"iotjs": "https://github.com/Samsung/iotjs/commit/",
	"jerryscript": "https://github.com/jerryscript-project/jerryscript/commit/",
	"nuttx": "https://bitbucket.org/nuttx/nuttx/commits/",
	"apps": "https://bitbucket.org/nuttx/apps/commits/"
};
var g_submod_order = [
	"iotjs",
	"nuttx",
	"apps"
];

function _render_submodules(submodules) {
	var raw_html = '<div class="submodules"><table>';
	$.each(g_submod_order, function(idx, name) {
		if (!(name in submodules))
			return;
		var submod = submodules[name];
		raw_html += '<tr class="submod-row submod-' + name + '">';
		raw_html += '<td>' + g_submod_nice_name[name] + '</td>';
		raw_html += '<td class="mono"><a href="' + g_submod_baseurl[name] + submod.commit + '">' + submod.commit.substring(0, 7) + '</a></td>';
		raw_html += '<td>';
		raw_html += '<span class="message">' + submod.message + '</span>';
		raw_html += '<span class="author">' + submod.author + '</span>';
		raw_html += '<span class="date">' + submod.date + '</span>';
		raw_html += '</td>';
		raw_html += '</tr>';
	});
	raw_html += '</table></div>';
	return raw_html;
}

function _render_showhide() {
	var raw_html = '<div class="showhide">';
	raw_html += '<span title="Show/hide test results"><i class="fa fa-eye fa-fw" aria-hidden="true"></i></span>';
	raw_html += '<span><input type="checkbox"></input></span>';
	raw_html += '<span><input type="checkbox" checked></input></span>';
	raw_html += '<span><input type="checkbox"></input></span>';
	raw_html += '</form>';
	return raw_html;
}

function _render_tests_table(uid, tests, earlier_tests_map) {
	var raw_html = '<div class="tests">';
	raw_html += '<table><thead><tr>'
		+ '<td>Test</td><td>Result</td><td>Memory</td><td>Change</td>'
		+ '<td>Output/Reason' + _render_showhide() + '</td>'
		+ '</tr></thead></table>';

	raw_html += '</div><div class="tests"><table>';

	$.each(tests, function(idx, test) {
		var row_class = "fail";
		if (test.result == "pass")
			row_class = "pass hidden";
		else if (test.result == "skip")
			row_class = "skip hidden";

		var text = '';
		if (test.hasOwnProperty("output")) {
			text = test.output;
		}
		if (test.hasOwnProperty("reason")) {
			if (text)
				text += '<br>';
			text += test.reason;
		}

		raw_html += '<tr class="' + row_class + '">';
		raw_html += '<td>' + test.name + '</td>';
		raw_html += '<td>' + test.result + '</td>';

		raw_html += '<td class="mono">';
		if (test.hasOwnProperty("memory"))
			raw_html += test.memory + " B";
		else
			raw_html += "n/a";
		raw_html += '</td>';

		raw_html += '<td class="mono">';

			var can_compare_current = (
				test.hasOwnProperty("memory") &&
				test.result == "pass" &&
				!isNaN(parseInt(test.memory))
			);
			var can_compare_prev = (
				test.name in earlier_tests_map &&
				earlier_tests_map[test.name].result == "pass" &&
				"memory" in earlier_tests_map[test.name] &&
				!isNaN(parseInt(earlier_tests_map[test.name].memory))
			);

			if (can_compare_current && can_compare_prev) {
				var diff = test.memory - earlier_tests_map[test.name].memory;
				var percent = (diff / earlier_tests_map[test.name].memory) * 100.0;
				raw_html += (diff >= 0 ? '+' : '') + percent.toFixed(1) + '%';
			}
			else {
				raw_html += '<span class="light">n/a</span>'
			}
		raw_html += '</td>';

		raw_html += '<td>';
		var test_detail_id = uid + '_' + idx;
		raw_html += '<div id="' + test_detail_id + '">' + text;
		if (text.indexOf("<br>") !== -1) {
			raw_html += '<div class="morebtn"><i class="fa fa-angle-down fa-fw" aria-hidden="true"></i></div>';
		}
		raw_html += '</div>'
		raw_html += '</td>';
		raw_html += '</tr>';
	});
	raw_html += '</table></div>';
	return raw_html;
}

function render_nochange(date) {
	var raw_html = '<div class="nochange">';
	raw_html += '<div>No change today in the repositories</div>';
	raw_html += '<div class="date">' + date.toISOString().substr(0, 10) + '</div>';
	raw_html += '</div>';

	return raw_html;
}

function date_floor(date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function subtract_one_day(date) {
	date.setUTCDate(date.getUTCDate() - 1);
}

function add_nochange_between(from, until, container) {
	subtract_one_day(from);
	while (from > until) {
		container.append(render_nochange(from));
		subtract_one_day(from);
	}
}

function render_testruns(testrun_arr, idx, idx_end) {
	if (idx >= testrun_arr.length)
		return;

	var testruns_div = $("#testruns");
	testruns_div.empty();

	var prev_testrun_date = date_floor(new Date(testrun_arr[idx].date));
	var first_date = date_floor(idx == 0 ? new Date() : new Date(testrun_arr[idx - 1].date));
	add_nochange_between(first_date, prev_testrun_date, testruns_div);

	anim_idx = 0;
	for (; idx < idx_end; idx++) {
		if (idx >= testrun_arr.length)
			break;

		var testrun = testrun_arr[idx];

		var testrun_date = date_floor(new Date(testrun.date));
		add_nochange_between(prev_testrun_date, testrun_date, testruns_div);
		prev_testrun_date = testrun_date;

		var testrun_id = "testrun_" + idx;
		var next_testrun = (idx + 1) >= testrun_arr.length
			? { tests_map: {} }
			: testrun_arr[idx + 1];
		testruns_div.append(render_testrun(testrun_id, testrun, next_testrun));

		var testrun_ref = "#" + testrun_id;
		$(testrun_ref + " > .morebtn").click(function(ref) {
			return function() {
				$(ref).toggleClass('expanded');
			}
		}(testrun_ref));

		$.each(testrun.tests, function(idx, test) {
			var test_detail_ref = testrun_ref + '_' + idx;
			$(test_detail_ref + " .morebtn").click(function(detail_ref){
				return function() {
					$(detail_ref).toggleClass('expanded');
				}
			}(test_detail_ref));
		});

		$(testrun_ref + " .showhide span:nth-child(2) input").click(function(ref) {
			return function() {
				$(ref + " tr.pass").toggleClass('hidden');
			}
		}(testrun_ref));
		$(testrun_ref + " .showhide span:nth-child(4) input").click(function(ref) {
			return function() {
				$(ref + " tr.skip").toggleClass('hidden');
			}
		}(testrun_ref));

		$(testrun_ref + " .showhide span:nth-child(3) input").click(function(ref) {
			return function() {
				$(ref + " tr.fail").toggleClass('hidden');
			}
		}(testrun_ref));
	}

	hide_loading();
}

function render_pagination(length, step) {
	var containers = $(".pagination");
	var btn_cnt = Math.ceil(length / step);

	var list = $('<ul></ul>');
	for (var btn_idx = 0; btn_idx < btn_cnt; btn_idx++) {
		var start = btn_idx * step;
		var raw_html = '<li><a>' + (start + 1) + '-' + (start + step) + '</a></li>';

		var item = $(raw_html).click(function(idx, start) {
			return function() {
				render_testruns(g_testruns, start, start + step);
				$(".pagination li").removeClass("active");
				$(".pagination li:nth-child(" + (idx + 1) + ")").addClass("active");
		    }
		}(btn_idx, start));
		list.append(item);
	}

	$.each(containers, function(idx, container) {
		$(container).empty().append(list);
	});

	$(".pagination li:first-child").addClass("active");
}
