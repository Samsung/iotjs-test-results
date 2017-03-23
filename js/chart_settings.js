var dataset = [];

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

function generate_chart(data, type) {
  var line_color = '#1f77b4';
  if (type === 'memory') {
    line_color = '#ff7f0e';
  }

  var chart = c3.generate({
    bindto: '#' + type + '-chart',
    size: {
      height: 220
    },
    data: {
      json: data,
      keys: {
        x: 'date',
        value: [type],
      },
      onclick: function(d, element) {
        chart.unselect([type],[d.index]);
        window.open('https://github.com/Samsung/iotjs/commit/' + data[d.index].commit);
      },
      selection: {
        enabled: true,
        multiple: false
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          count: 10,
          fit: true,
          format: '%Y-%m-%d'
        }
      }
    },
    color: {
      pattern: [line_color]
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
              d[0].name +
            '</td>' +
            '<td class="value">' + ((d[0].value === null) ? 'N/A' : d[0].value) + '</td>' +
          '</tr>' +
          '<tr class="c3-tooltip-name--commit">' +
            '<td class="name">commit</td>' +
            '<td class="value">' + data[d[0].index].commit.substring(0, 7) + '</td>' +
          '</tr>' +
        '</tbody>' +
        '</table>';

        return tt;
      }
    }
  });
}

function iso_date(date) {
  return new Date(date).toISOString().substr(0, 10);
}

function fetch_chart_data(device) {
  dataset = [];

  $.getJSON('data/' + device + '/stat.json')
  .done(function(chart_json) {
    $.each(chart_json, function(key, val) {
      val.date = iso_date(val.date);
      if (val.memory === 0) {
        delete val.memory;
      }
      dataset.push(val);
    });

    init_datepickers(dataset[0].date, dataset[dataset.length - 1].date);

    var start = new Date(dataset[dataset.length - 1].date);
    start.setMonth(start.getMonth() - 2);
    if (start < new Date(dataset[0].date)) {
      start = dataset[0].date;
    }
    $('#chart-datepicker-from').val(iso_date(start));

    update_chart(start, dataset[dataset.length - 1].date);
  })
  .fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ', ' + error;
    console.error('Request Failed: ' + err);
  });
}

function update_chart(from, to) {
  var slice = [],
      d_from = new Date(from),
      d_to = new Date(to);
  $.each(dataset, function(key, val) {
    var date = new Date(val.date);
    if (date.valueOf() >= d_from.valueOf()
        && date.valueOf() <= d_to.valueOf())
    {
      slice.push(val);
    }
  });

  generate_chart(slice, 'binary');
  generate_chart(slice, 'memory');
}
