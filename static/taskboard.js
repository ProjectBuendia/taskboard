var ROOT_URL = '';

var current_tid = 1;
var board_data = {};
var state_data = {};

// Adds a tab to the tab list on the left.
function add_tab(tid, label) {
  $('#tablist').append(
      $('<div class="tab" id="tab-' + tid + '"></div>')
          .text(label)
          .click((function(tid) {
            return function(event) { select_tab(tid); };
          })(tid))
  );
}

// Updates the display of the board labels and layout based on the board data.
function update_board() {
  var tablist = $('#tablist');
  var labels = (board_data.tabs || {}).labels;
  var order = (board_data.tabs || {}).order || [];

  // default to first tab if current tab is removed
  var new_tid = (current_tid === 'ALL' && 'ALL') || order[0];

  tablist.empty();
  for (var i = 0; i < order.length; i++) {
    var tid = order[i];
    add_tab(tid, labels[tid] || '');
    if (tid === current_tid) {
      new_tid = tid; // current tab still exists, stay on it
    }
  }
  add_tab('ALL', 'ALL');

  // To visually connect the selected tab and the board, the right edge of
  // the selected tab flares out; this is achieved with a rounded bottom-right
  // corner on the tab above, and a rounded top-right corner on the tab below.
  // We add an extra tab below so that this also works for the last tab.
  $('#tablist').append(
      $('<div class="tab" id="tab-EXTRA"></div>')
  );

  var board = $('#board');
  labels = (board_data.cells || {}).labels;
  var layout = (board_data.cells || {}).layout || [];

  board.empty();
  for (var r = 0; r < layout.length; r++) {
    var row = $('<div class="row"></div>')
        .css('height', (100./layout.length) + '%');
    board.append(row);
    for (var c = 0; c < layout[r].length; c++) {
      var cid = layout[r][c];
      row.append(
          $('<div class="cell" id="cell-' + cid + '"></div>')
              .text(labels[cid] || '')
              .css('width', (100./layout[r].length) + '%')
              .click((function(cid) {
                return function(event) { toggle_cell(cid); };
              })(cid))
      );
    }
  }

  select_tab(new_tid);
}

// Switch to a particular tab (by tab ID).  The special tab with ID 'ALL'
// is the list showing all tasks.
function select_tab(tid) {
  current_tid = tid;
  update_cells();
  update_list();
  if (tid === 'ALL') {
    $('#board').hide();
    $('#list').show();
  } else {
    $('#board').show();
    $('#list').hide();
  }
}

// Updates the display of the tabs and cells based on the button state data.
function update_cells() {
  var order = ((board_data.tabs || {}).order || []).concat(['ALL', 'EXTRA']);
  var layout = (board_data.cells || {}).layout || [];
  var tid, cells_on, r, c, cell_states;
  for (var i = 0; i < order.length; i++) {
    tid = order[i];
    $('#tab-' + tid).toggleClass('above-selected', order[i+1] === current_tid);
    $('#tab-' + tid).toggleClass('selected', order[i] === current_tid);
    $('#tab-' + tid).toggleClass('below-selected', order[i-1] === current_tid);
    cells_on = 0;
    cell_states = state_data[tid] || {};
    for (r = 0; r < layout.length; r++) {
      for (c = 0; c < layout[r].length; c++) {
        cid = layout[r][c] + '';
        if (!cid.match(/^r/)) {
          cells_on += (cell_states[cid] ? 1 : 0);
        }
      }
    }
    $('#tab-' + tid).toggleClass('on', cells_on > 0);
  }

  var cell_states = state_data[current_tid] || {};
  var layout = (board_data.cells || {}).layout || [];
  for (r = 0; r < layout.length; r++) {
    for (c = 0; c < layout[r].length; c++) {
      cid = layout[r][c];
      $('#cell-' + cid).toggleClass('on', !!cell_states[cid]);
    }
  }
}

// Updates the display of the list of tasks based on the cell state data.
function update_list() {
  $('#list').empty();
  var order = (board_data.tabs || {}).order || [];
  var layout = (board_data.cells || {}).layout || [];
  var tab_labels = (board_data.tabs || {}).labels || {};
  var cell_labels = (board_data.cells || {}).labels || {};
  var tid;
  for (var i = 0; i < order.length; i++) {
    tid = order[i];
    var cell_states = state_data[tid] || {};
    for (var r = 0; r < layout.length; r++) {
      for (var c = 0; c < layout[r].length; c++) {
        cid = layout[r][c] + '';
        if (cell_states[cid] && !cid.match(/^r/)) {
          $('#list').append(
              $('<div class="item"></div>')
                  .text(tab_labels[tid] + ' - ' + cell_labels[cid])
          );
        }
      }
    }
  }
};

// Changes the state of one of the cells.
function toggle_cell(toggle_cid) {
  var cell_states = state_data[current_tid] || {};
  var layout = (board_data.cells || {}).layout || [];
  for (var r = 0; r < layout.length; r++) {
    for (var c = 0; c < layout[r].length; c++) {
      var cid = layout[r][c];
      if (cid === toggle_cid) {
        cell_states[cid] = !cell_states[cid];
        $('#cell-' + cid).toggleClass('on', !!cell_states[cid]);
        send_cell(cid, cell_states[cid]);
        update_cells();
        return;
      }
    }
  }
};

// Sends the state of one of the cells to the server.
function send_cell(cid, state) {
  $.ajax({
    url: ROOT_URL + '/state',
    type: 'POST',
    data: 'tid=' + current_tid + '&' + cid + '=' + (state ? 1 : 0)
  });
}

// Changes the label on one of the cells.  (Currently unused.)
function set_cell_label(cid, label) {
  (board_data.cells || {}).labels[cid] = label;
  send_cell_labels();
}

// Changes the label on one of the tabs.  (Currently unused.)
function set_tab_label(tid, label) {
  (board_data.tabs || {}).labels[tid] = label;
  send_tab_labels();
}

// Polls the server for an update to the board layout and labels.
function poll_board() {
  $.ajax({
    url: ROOT_URL + '/board',
    type: 'GET',
    dataType: 'JSON',
    success: function(data) { 
      board_data = data;
      update_board();
    }
  });
}

// Polls the server for an update to the cell states.
function poll_state() {
  $.ajax({
    url: ROOT_URL + '/state',
    type: 'GET',
    dataType: 'JSON',
    success: function(data) { 
      state_data = data;
      update_cells();
      update_list();
    }
  });
}

// Starts the polling loop.
$(document).on('ready', function() {
  poll_board();
  setInterval(poll_state, 2000);
  setInterval(poll_board, 10000);
});
