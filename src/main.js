const Geokeyboard = require('./geokeyboard');
const Select = require('./geokeyboard.select.js');
const Checkbox = require('./geokeyboard.checkbox.js');
const LocalStorage = require('./geokeyboard.localstorage.js');
const insertAtCaret = require('./insert-at-caret');

Geokeyboard.extensions = { Select, Checkbox, LocalStorage, insertAtCaret };

window.Geokeyboard = Geokeyboard;