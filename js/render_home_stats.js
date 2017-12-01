var data = [];

$(document).ready(function() {
  fetch_last_entries();
});

function fetch_last_entries() {
  if (firebase.apps.length) {
    data = [];

    for (const i in devices) {
      if (devices.hasOwnProperty(i)) {
        firebase.database().ref('iotjs/' + i).limitToLast(1).on('child_added', function(childSnapshot) {
          var snapshot = childSnapshot.val();

          data.push({
            id: i,
            name: devices[i],
            date: snapshot.date,
            stats: fetch_stats(snapshot.tests)
          });

          if (data.length === Object.keys(devices).length) {
            render_project_targets();
          }
        });
      }
    }
  }
}

function fetch_stats(tests) {
  var stats = {
    pass: 0,
    skip: 0,
    fail: 0
  };

  for (const i in tests) {
    if (tests.hasOwnProperty(i)) {
      const element = tests[i];

      if (element.result === 'pass') {
        stats.pass++;
      } else if (element.result === 'skip') {
        stats.skip++;
      } else if (element.result === 'fail') {
        stats.fail++;
      }
    }
  }

  return stats;
}

function render_target_block_content(target) {
  var raw_html = '<a href="?view=' + target.id + '">';
  raw_html += '<div class="target-block-content" id="' + target.id + '-home-result">';
  raw_html += '<div class="target-block-header text-center">';
  raw_html += '<h3>' + target.name + '</h3>';
  raw_html += '<p class="lead">Last measured <b>' + target.date.substr(0, 10) + '</b></p>';
  raw_html += '</div>';
  raw_html += '<div class="target-block-result">';
  raw_html += '<div class="row">';
  raw_html += '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 text-center target-block-result-passed" title="Passed">';
  raw_html += '<i class="fa fa-check fa-fw" aria-hidden="true"></i>';
  raw_html += '<span class="result-passed-number">' + target.stats.pass + '</span>';
  raw_html += '</div>';
  raw_html += '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 text-center target-block-result-failed" title="Failed">';
  raw_html += '<i class="fa fa-times fa-fw" aria-hidden="true"></i>';
  raw_html += '<span class="result-failed-number">' + target.stats.fail + '</span>';
  raw_html += '</div>';
  raw_html += '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 text-center target-block-result-skipped" title="Skipped">';
  raw_html += '<i class="fa fa-step-forward fa-fw" aria-hidden="true"></i>';
  raw_html += '<span class="result-skipped-number">' + target.stats.skip + '</span>';
  raw_html += '</div>';
  raw_html += '</div>';
  raw_html += '</div>';
  raw_html += '</div>';
  raw_html += '</a>';

  return raw_html;
}

function render_project_target_col() {
  var raw_html = '';

  for (const i in data) {
    if (data.hasOwnProperty(i)) {
      raw_html += '<div class="col-sm-4 col-md-4 col-lg-4 target-block">';
      raw_html += render_target_block_content(data[i]);
      raw_html += '</div>';
    }
  }

  return raw_html;
}

function render_project_targets() {

  var raw_html = '<div class="row">';
  raw_html += render_project_target_col();
  raw_html += '</div>';

  $('#home-targets').html(raw_html);
}
