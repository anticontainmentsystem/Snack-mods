const snack = window.SnackCondiment;
const panel = snack.context.shortcutPanel;
const $ = id => document.getElementById(id);
const call = (operation, args = {}) => snack.call('condiment-shortcuts', { operation, windowId:snack.context.windowId, ...(panel ? { cell:panel.cell } : {}), ...args });
let state, clickTimer, statusTimer, renderVersion = 0, work = Promise.resolve();
let adding;

function notice(message) {
  $('status').textContent = message;
  $('status').hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('status').hidden = true; }, 4500);
}
function run(task) {
  work = work.then(task).catch(error => notice(error.message));
  return work;
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, label, click) {
  const node = element('button', text);
  node.type = 'button';
  node.title = label;
  node.setAttribute('aria-label', label);
  node.onclick = click;
  return node;
}
function putImage(node, image) {
  const img = element('img');
  img.src = image;
  img.alt = '';
  node.replaceChildren(img);
}
function picture(item, requestThumbnail) {
  const node = element('span', {web:'↗',folder:'▰',file:'▤',app:'▣',shortcut:'↪'}[item.kind], 'picture');
  if (item.icon) putImage(node, item.icon);
  if (requestThumbnail) {
    const version = renderVersion;
    call('thumbnail', { shortcutId:item.id }).then(({ image }) => {
      if (image && node.isConnected && version === renderVersion) putImage(node, image);
    }).catch(() => {});
  }
  return node;
}

function renderRail() {
  document.body.classList.toggle('vertical', state.vertical);
  $('rail').hidden = false;
  $('rail').replaceChildren(...state.cells.map((items, cell) => {
    const open = () => run(() => call('preview-cell', { cell }));
    const organize = () => { clearTimeout(clickTimer); run(() => call('organize', { cell })); };
    const node = button('', 'Cell '+(cell + 1)+' · '+items.length+' shortcuts', event => {
      if (event.detail > 1) return;
      clearTimeout(clickTimer);
      if (event.detail === 0) open();
      else clickTimer = setTimeout(open, 280);
    });
    node.className = 'cell';
    node.dataset.selected = String(state.selected === cell);
    node.ondblclick = organize;
    node.oncontextmenu = event => { event.preventDefault(); organize(); };
    node.onkeydown = event => { if (event.key === 'F2') { event.preventDefault(); organize(); } };
    if (!items.length) node.textContent = '+';
    else {
      const pod = element('span', '', 'pod');
      pod.append(...items.map(item => picture(item, false)));
      node.append(pod);
    }
    return node;
  }));
}

function update(operation, args = {}) {
  return run(async () => {
    const previous = state.cells[panel.cell].length;
    state = await call(operation, args);
    if (state.cells[panel.cell].length > previous) adding = false;
    renderPanel();
  });
}
function renderAddControls() {
  const editing = panel.mode === 'editor', count = state.cells[panel.cell].length;
  const canAdd = editing && count < 4;
  const showForm = canAdd && (adding ?? count === 0);
  $('start-add').hidden = !canAdd || showForm;
  $('start-add').textContent = 'Add shortcut to slot ' + (count + 1);
  $('add-title').textContent = 'Add to slot ' + (count + 1);
  $('add-controls').hidden = !showForm;
}
function renderPanel(thumbnails = true) {
  const editing = panel.mode === 'editor', items = state.cells[panel.cell];
  renderVersion++;
  document.body.classList.toggle('preview', !editing);
  $('panel').hidden = false;
  $('title').textContent = (editing ? 'Organize cell ' : 'Cell ') + (panel.cell + 1);
  $('count').textContent = items.length + ' of 4 shortcuts';
  $('manage').hidden = $('back').hidden = editing;
  renderAddControls();
  $('editor-actions').hidden = !editing;
  $('entries').replaceChildren(...items.map((item, index) => {
    if (!editing) {
      const card = button('', 'Open '+item.name, () => run(() => call('launch', { shortcutId:item.id })));
      card.className = 'card';
      const location = element('span', item.location, 'location');
      location.title = item.location;
      card.append(picture(item, thumbnails), element('strong', item.name), location);
      return card;
    }
    const row = element('div', '', 'entry'), details = element('div'), controls = element('div', '', 'reorder');
    const name = element('input');
    name.type = 'text';
    name.value = item.name;
    name.maxLength = 120;
    name.setAttribute('aria-label', 'Name for shortcut '+(index + 1));
    name.onchange = () => update('rename', { shortcutId:item.id, label:name.value });
    name.onkeydown = event => { if (event.key === 'Enter') name.blur(); };
    const location = element('span', item.location, 'location');
    location.title = item.location;
    details.append(name, location);
    const move = direction => update('move', { shortcutId:item.id, direction });
    const up = button('↑', 'Move '+item.name+' up', () => move(-1));
    const down = button('↓', 'Move '+item.name+' down', () => move(1));
    up.disabled = index === 0;
    down.disabled = index === items.length - 1;
    controls.append(up, down, button('×', 'Remove '+item.name, () => update('remove', { shortcutId:item.id })));
    row.append(picture(item, thumbnails), details, controls);
    return row;
  }));
  if (!items.length && editing) $('entries').append(element('p', 'Choose one file, folder, or link to add the first shortcut.'));
}

if (panel) {
  $('start-add').onclick = () => { adding = true; renderAddControls(); $('files').focus(); };
  $('add-back').onclick = () => { adding = false; renderAddControls(); $('start-add').focus(); };
  $('manage').onclick = () => run(() => call('organize'));
  $('back').onclick = () => run(() => call('close-panel'));
  $('files').onclick = () => update('pick');
  $('folder').onclick = () => update('pick', { folder:true });
  $('drop').onclick = () => run(() => call('drop'));
  $('save').onclick = () => run(() => call('save-editor'));
  $('cancel').onclick = () => run(() => call('cancel-editor'));
  $('clear-cache').onclick = () => run(async () => {
    const result = await call('clear-thumbnails');
    renderPanel(false);
    notice('Cleared '+result.removed+' cached thumbnails.');
  });
  $('link-form').onsubmit = event => {
    event.preventDefault();
    const url = $('url').value;
    run(async () => { state = await call('link', { url }); adding = false; $('url').value = ''; renderPanel(); });
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') run(() => call(panel.mode === 'editor' ? 'cancel-editor' : 'close-panel'));
  });
}
function refresh() {
  return run(async () => {
    const next = await call('state');
    if (state && JSON.stringify(next) === JSON.stringify(state)) return;
    if (panel && state && next.cells[panel.cell].length > state.cells[panel.cell].length) adding = false;
    state = next;
    if (panel) renderPanel();
    else renderRail();
  });
}
snack.onChange(refresh);
refresh();
