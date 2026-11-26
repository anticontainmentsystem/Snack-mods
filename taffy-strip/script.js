const snack = window.SnackCondiment;
const $ = id => document.getElementById(id);
const fold = $('fold'), organizer = $('organizer');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state, selected = null, timer, busy = false, messageTimeout;
const call = (operation, args = {}) => snack.call('condiment-shortcuts', { operation, windowId:snack.context.windowId, ...args });

function button(label, handler, title = label) {
  const node = document.createElement('button');
  node.textContent = label;
  node.title = title;
  node.setAttribute('aria-label', title);
  node.onclick = handler;
  return node;
}
function icon(item, className) {
  const node = document.createElement('span');
  if (className) node.className = className;
  if (item.icon) {
    const image = document.createElement('img');
    image.src = item.icon;
    image.alt = '';
    node.append(image);
  } else node.textContent = {web:'↗',folder:'▰',file:'▤',app:'▣',shortcut:'↪'}[item.kind];
  return node;
}
function report(error) {
  const status = $('status');
  status.textContent = error.message;
  status.hidden = false;
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => { status.hidden = true; }, 6000);
}
async function perform(work) {
  if (busy) return;
  busy = true;
  try { await work(); } catch (error) { report(error); }
  finally { busy = false; }
}
function draw() {
  document.body.classList.toggle('vertical', state.vertical);
  document.body.classList.toggle('expanded', selected !== null);
  document.body.dataset.edge = state.edge || '';
  const rail = $('rail');
  rail.replaceChildren();
  state.cells.forEach((items, cell) => {
    const element = button('', event => {
      if (event.detail > 1) return;
      clearTimeout(timer);
      const toggle = () => perform(() => expand(selected === cell ? null : cell));
      if (event.detail === 0) toggle();
      else timer = setTimeout(toggle, 300);
    }, 'Cell ' + (cell + 1) + ', ' + items.length + ' shortcuts');
    element.className = 'cell';
    element.setAttribute('aria-expanded', String(selected === cell));
    element.ondblclick = () => { clearTimeout(timer); perform(() => manage(cell)); };
    element.onkeydown = event => {
      if (event.key === 'F2') { event.preventDefault(); perform(() => manage(cell)); }
    };
    if (items.length) {
      const pod = document.createElement('span');
      pod.className = 'pod';
      pod.append(...items.map(item => icon(item)));
      element.append(pod);
    } else {
      const empty = document.createElement('span');
      empty.className = 'empty';
      empty.textContent = '+';
      element.append(empty);
    }
    rail.append(element);
  });
  fold.hidden = selected === null;
  if (selected === null) return;
  $('cell-name').textContent = 'Cell ' + (selected + 1);
  $('organizer-title').textContent = 'Manage cell ' + (selected + 1);
  const cards = $('cards'), entries = $('entries'), items = state.cells[selected];
  cards.replaceChildren();
  entries.replaceChildren();
  for (const [index, item] of items.entries()) {
    const card = button('', () => update('launch', { shortcutId:item.id }), 'Launch ' + item.name);
    card.className = 'card';
    const name = document.createElement('strong'), location = document.createElement('span');
    name.textContent = item.name;
    location.textContent = item.location;
    location.title = item.location;
    card.append(icon(item, 'shortcut-icon'), name, location);
    cards.append(card);
    const row = document.createElement('div'), entry = document.createElement('span');
    row.className = 'entry';
    entry.className = 'entry-name';
    entry.textContent = item.name;
    entry.title = item.location;
    const up = button('↑', () => update('move', { shortcutId:item.id, direction:-1 }), 'Move '+item.name+' earlier');
    const down = button('↓', () => update('move', { shortcutId:item.id, direction:1 }), 'Move '+item.name+' later');
    up.disabled = index === 0;
    down.disabled = index === items.length - 1;
    row.append(icon(item, 'shortcut-icon'), entry, up, down, button('×', () => update('remove', { shortcutId:item.id }), 'Remove '+item.name));
    entries.append(row);
  }
  if (items.length < 4) cards.append(button('Add shortcut', () => perform(() => manage(selected))));
  $('add-controls').hidden = items.length >= 4;
}
async function expand(cell) {
  if (cell === null && !fold.hidden && !reduceMotion.matches) {
    fold.classList.add('rolling-up');
    await new Promise(resolve => setTimeout(resolve, 240));
    fold.classList.remove('rolling-up');
  }
  state = await call('resize', { expanded:cell !== null, ...(cell === null ? {} : { cell }) });
  selected = cell;
  if (cell === null && organizer.open) organizer.close();
  draw();
}
async function manage(cell) {
  if (selected !== cell) await expand(cell);
  if (!organizer.open) organizer.showModal();
}
function update(operation, args) {
  return perform(async () => { state = await call(operation, { cell:selected, ...args }); draw(); });
}
$('collapse').onclick = () => perform(() => expand(null));
$('manage').onclick = () => perform(() => manage(selected));
$('done').onclick = () => organizer.close();
$('files').onclick = () => update('pick');
$('folder').onclick = () => update('pick', { folder:true });
$('drop').onclick = () => perform(() => call('drop', { cell:selected }));
$('link-form').onsubmit = event => {
  event.preventDefault();
  perform(async () => {
    state = await call('link', { cell:selected, url:$('url').value });
    $('url').value = '';
    draw();
  });
};
const rotate = button('↻', () => perform(async () => {
  state = await call('resize', { vertical:!state.vertical, expanded:true });
  draw();
}), 'Rotate Taffy Strip');
fold.querySelector('header').insertBefore(rotate, $('collapse'));
snack.onChange(() => perform(async () => { state = await call('state'); selected = state.selected; if(selected === null && organizer.open) organizer.close(); draw(); }));
perform(async () => { state = await call('resize', { expanded:false }); draw(); });
