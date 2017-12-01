var rendered_sections = [];
var g_page_step = 10;
var g_db_keys = [];
var g_db_ref = "";

$(document).ready(function() {
  var view = get_parameter_by_name('view');

  // Set home as a default view.
  if (!(views.includes(view))) {
    view = 'home';
  }

  change_view(view);
});

function change_view(target) {
  if (target === 'home') {
    $('#home-info').show();
    $('#target-info').hide();
  } else {
    $('#home-info').hide();
    $('#target-info').show();

    $('#css-dynamic').attr('href', 'css/device_' + target + '.css');

    clear();
    set_info(target);
    fetch_keys(target);
  }

  $('#navbar li').removeClass('active');
  $('#show-' + target).addClass('active');
}

function render_done(section) {
  rendered_sections.push(section);

  if (rendered_sections.length === 2) {
    $('#target-info-placeholder').hide();
    $('.loading-part').show();

    charts.forEach(function(chart) {
      chart.flush();
    });
  }
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
    case "artik053":
      $("#info-device")
        .attr('href', "https://developer.artik.io/documentation/artik-05x/")
        .text("Artik 053");
      $("#info-platform")
        .attr('href', "https://github.com/Samsung/TizenRT")
        .text("TizenRT");
      $("#info-image").attr('src', "img/artik053.jpg");
      break;
  }
}

function fetch_keys(device) {
  g_db_keys = []

  g_db_ref = firebase.database().ref('iotjs/' + device);

  axios.get(g_db_ref.toString() + '.json?shallow=true')
    .then(function (res) {
      if (res.data) {
        g_db_keys = Object.keys(res.data).sort();
        var pageCount = g_db_keys.length / g_page_step;
        render_pagination(g_db_keys.length, g_page_step);
        g_db_keys.reverse();
        render_testruns(0, g_page_step - 1);
      }
      fetch_chart_data(device);

    });
}

function get_parameter_by_name(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
