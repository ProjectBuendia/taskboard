Taskboard
---------

Provides a board with a configurable number of rows, a configurable number
of buttons in each row, and configurable labels on the buttons.  Each button
can be toggled on and off, and its state is reflected on all other clients
that are viewing the board.

There is a configurable number of tabs, and each tab has its own copy of the
board with its own button states.

There is also a tab that lists all the active task buttons across all the tabs.

Typical use: tabs are locations, buttons are tasks to be done (e.g. cleaning
needed in Tent 2).  Or buttons are resources in use or available (e.g. Bed 5
in use in Tent 3).

To do:
  - Add shared counters (e.g. number of beds available) with "+" and "-"
    buttons to increment and decrement, and total count shown on the "ALL" tab.
  - Add simple editing functions (add/remove buttons, edit button labels,
    add/remove tabs, edit tab labels).
  - Automatically scale the text font size to fit the size of the window and
    number of buttons, for maximum visibility on a variety of screen sizes.
