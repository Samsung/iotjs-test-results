var charts = [];

function init_datepickers(first_date, last_date) {
  var picker_options = {
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true,
    numberOfMonths: 1
  },
  from = $('#chart-datepicker-from').datepicker(picker_options),
  to = $('#chart-datepicker-to').datepicker(picker_options);

  from.datepicker('option', 'minDate', first_date);
  from.datepicker('option', 'maxDate', last_date);
  to.datepicker('option', 'minDate', first_date);
  to.datepicker('option', 'maxDate', last_date);

  from.on('change', function() {
    to.datepicker('option', 'minDate', getDate(this));
    update_chart(getDate(this), getDate(to[0]));
  }).val(first_date);

  to.on('change', function() {
    from.datepicker('option', 'maxDate', getDate(this));
    update_chart(getDate(from[0]), getDate(this));
  }).val(last_date);

  function getDate(element) {
    var date;
    try {
      date = new Date(element.value);
    } catch (error) {
      date = null;
    }

    return date;
  }
}

function generate_chart(data, type, y_axis_min) {
  var typedColor = ['#ff7f0e'];

  if (type === 'memory') {
    var type_key = 'average_memory';
    var label_name = 'average memory consumption (KB)';

    var typedData = {
      json: data,
      names: {
        [type_key] : label_name
      },
      keys: {
        x: 'date',
        value: [type_key],
      },
      onclick: function(d, element) {
        chart.unselect([type],[d.index]);
        window.open('https://github.com/Samsung/iotjs/commit/' + data[d.index].submodules.iotjs.commit);
      },
      selection: {
        enabled: true,
        multiple: false
      }
    };
  } else if (type === 'binary') {
    typedColor.push('#aec7e8');
    var target_profile = 'bin.target_profile.total';
    var minimal_profile = 'bin.minimal_profile.total';

    var label_name_first = 'target-profile binary size (KB)';
    var label_name_second = 'minimal-profile binary size (KB)';

    var typedData = {
      json: data,
      names: {
        [target_profile] : label_name_first,
        [minimal_profile] : label_name_second,
      },
      keys: {
        x: 'date',
        value: [target_profile, minimal_profile],
      },
      onclick: function(d, element) {
        chart.unselect([type],[d.index]);
        window.open('https://github.com/Samsung/iotjs/commit/' + data[d.index].submodules.iotjs.commit);
      },
      selection: {
        enabled: true,
        multiple: false
      }
    };
  } else {
    console.error('Unsupported type in generate_chart function!')
  }

  var chart = c3.generate({
    bindto: '#' + type + '-chart',
    size: {
      height: 220
    },
    data: typedData,
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          count: 10,
          fit: true,
          format: '%Y-%m-%d'
        }
      },
      y: {
        min: y_axis_min
      }
    },
    color: {
      pattern: typedColor
    },
    tooltip: {
      contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
        var tt = '<table class="c3-tooltip">' +
        '<tbody>' +
          '<tr>' +
            '<th colspan="2">' + data[d[0].index].date + '</th>' +
          '</tr>' +
          '<tr class="c3-tooltip-name--binary">' +
            '<td class="name">' +
              '<span style="background-color: ' + color(d[0]) + '"></span>' +
            '</td>' +
            '<td class="value">' + ((d[0].value === null) ? 'n/a' : d[0].value.toFixed(1)) + ' KB</td>' +
          '</tr>';
          if (type === 'binary') {
            tt += '<tr class="c3-tooltip-name--binary">' +
            '<td class="name">' +
              '<span style="background-color: ' + color(d[1]) + '"></span>' +
            '</td>' +
            '<td class="value">' + ((d[1].value === null) ? 'n/a' : d[1].value.toFixed(1)) + ' KB</td>' +
          '</tr>';
          }
          tt += '<tr class="c3-tooltip-name--commit">' +
            '<td class="name">commit</td>' +
            '<td class="value">' + data[d[0].index].submodules.iotjs.commit.substring(0, 7) + '</td>' +
          '</tr>' +
        '</tbody>' +
        '</table>';

        return tt;
      }
    }
  });

  charts.push(chart);
}

function iso_date(date) {
  return new Date(date).toISOString().substr(0, 10);
}

function fetch_chart_data(device) {
  if (!firebase.apps.length || g_db_keys.length <= 0) {
    return;
  }

  g_db_ref.child(g_db_keys[g_db_keys.length - 1]).once('value').then(function(snapshot) {
    var first_element = snapshot.val();
    g_db_ref.child(g_db_keys[0]).once('value').then(function(snapshot) {
      var last_element = snapshot.val();

      init_datepickers(iso_date(first_element.date), iso_date(last_element.date));

      var start_date = new Date(last_element.date);
      start_date.setMonth(start_date.getMonth() - 2);
      if (start_date < new Date(first_element.date)) {
        start_date = new Date(first_element.date);
      }

      start_date = iso_date(start_date)

      update_chart(start_date, last_element.date);

      $('#chart-datepicker-from').val(start_date);
    }, function(error) {
      console.error(error);
    });
  }, function(error) {
    console.error(error);
  });
}

function update_chart(from, to) {
  var slice = [];
  var date_to = new Date(to);
  date_to.setDate(date_to.getDate() + 1);
  g_db_ref.orderByChild('date').startAt(iso_date(from)).endAt(iso_date(date_to)).once("value", function(testcases) {
    var min_avg_memory = 0;
    var min_bin_size = 0;

    testcases.forEach(function (testcase) {
      var average_memory = 0;
      var memory_counter = 0;
      var data = testcase.val();
      data.date = iso_date(data.date);

      var bin_target_total = parseInt(Number(data.bin.target_profile.total));
      // Convert it to kilobytes
      data.bin.target_profile.total = (bin_target_total / 1024).toFixed(1);

      var bin_minimal_total = parseInt(Number(data.bin.minimal_profile.total));
      // Convert it to kilobytes
      data.bin.minimal_profile.total = (bin_minimal_total / 1024).toFixed(1);

      data.tests.forEach(function(testname) {
        if (testname.hasOwnProperty('memory')) {
          var number = parseInt(Number(testname.memory.total));
          if (number == testname.memory.total) {
            memory_counter++;
            average_memory += number;
          }
        }

      });

      if (memory_counter > 0) {
        data.average_memory = average_memory / memory_counter;
        // Convert it to kilobytes
        data.average_memory = (data.average_memory / 1024).toFixed(1);

        if (min_avg_memory == 0 || min_avg_memory > data.average_memory) {
          min_avg_memory = data.average_memory;
        }
      }

      if (min_bin_size == 0 || min_bin_size > data.bin.target_profile.total) {
        min_bin_size = data.bin.target_profile.total;
      }

      slice.push(data);
    });

    y_axis_min = (min_bin_size / 2).toFixed();
    generate_chart(slice, 'binary', y_axis_min);

    y_axis_min = (min_avg_memory / 2).toFixed();
    generate_chart(slice, 'memory', y_axis_min);

    render_done('chart');
  });
}
