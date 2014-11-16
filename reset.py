#!/usr/bin/env python

"""Erases and resets the database to a starting state with some sample data."""

import json
import sqlite3

board_data = {
  'tabs': {
    'order': [1, 2, 3, 4, 5, 6],
    'labels': {
      '1': 'Tent 1',
      '2': 'Tent 2',
      '3': 'Tent 3',
      '4': 'Tent 4',
      '5': 'Tent 5',
      '6': 'Tent 6',
    }
  },
  'cells': {
    'layout': [
      # cell IDs not starting with 'r' are tasks, listed in the ALL tab
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [],
      # cell IDs starting with 'c' are counters rather than tasks
      ['c1'],
      # cell IDs starting with 'r' are resources rather than tasks
      ['r1', 'r2', 'r3', 'r4', 'r5'],
      ['r6', 'r7', 'r8', 'r9', 'r10'],
    ],
    'labels': {
      '1': 'IV bag needed',
      '2': 'ORS needed',
      '3': 'Pain meds needed',
      '4': '',
      '5': 'Cleaning needed',
      '6': 'Chlorine refill needed',
      '7': 'Mop needed',
      '8': '',
      'c1': 'Beds available',
      'r1': 'Bed 1 in use',
      'r2': 'Bed 2 in use',
      'r3': 'Bed 3 in use',
      'r4': 'Bed 4 in use',
      'r5': 'Bed 5 in use',
      'r6': 'Bed 6 in use',
      'r7': 'Bed 7 in use',
      'r8': 'Bed 8 in use',
      'r9': 'Bed 9 in use',
      'r10': 'Bed 10 in use',
    }
  }
}

sql = '''
drop table if exists items;

create table items (
    id text primary key,
    value text
);

insert into items (id, value) values ('board', '%s'), ('state', '{}');
''' % json.dumps(board_data)

db = sqlite3.connect('data.db')
db.cursor().executescript(sql)
db.commit()
