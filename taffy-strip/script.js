const snack = window.SnackCondiment;
const panel = snack.context.shortcutPanel;
const $ = id => document.getElementById(id);
const call = (operation, args = {}) => snack.call('condiment-shortcuts', { operation, windowId:snack.context.windowId, ...(panel ? { cell:panel.cell } : {}), ...args });
let state, clickTimer, statusTimer, renderVersion = 0, work = Promise.resolve();
let spotSelection;

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
      pod.append(...items.map(item => {
        const node = picture(item, false);
        node.style.gridRow = Math.floor(item.slot / 2) + 1;
        node.style.gridColumn = item.slot % 2 + 1;
        return node;
      }));
      node.append(pod);
    }
    return node;
  }));
}

function currentSpot() {
  return state.cells[panel.cell].find(item => item.slot === spotSelection?.slot);
}

function update(operation, args = {}) {
  return run(async () => {
    state = await call(operation, args);
    renderPanel();
  });
}

function changeSpot(slot, item) {
  spotSelection = { slot, replace:!!item, previousId:item?.id };
  $('url').value = '';
  renderPanel(false);
  $('files').focus();
}

function spotAction(operation, args = {}) {
  if (!spotSelection) return;
  const { slot, replace, previousId } = spotSelection;
  return run(async () => {
    if (operation === 'drop') {
      await call(operation, { slot, replace });
      return;
    }
    state = await call(operation, { slot, replace, ...args });
    if (currentSpot()?.id !== previousId) spotSelection = undefined;
    renderPanel();
  });
}

function renderSourcePicker() {
  const item = currentSpot();
  if (spotSelection && item?.id !== spotSelection.previousId) spotSelection = undefined;
  $('add-controls').hidden = !spotSelection;
  if (!spotSelection) return;
  const action = spotSelection.replace ? 'Replace' : 'Add to';
  $('add-title').textContent = action + ' spot ' + (spotSelection.slot + 1);
  $('use-link').textContent = spotSelection.replace ? 'Replace with link' : 'Add link';
}

function renderPanel(thumbnails = true) {
  const editing = panel.mode === 'editor', items = state.cells[panel.cell];
  renderVersion++;
  document.body.classList.toggle('preview', !editing);
  document.body.classList.toggle('editor', editing);
  $('panel').hidden = false;
  $('title').textContent = (editing ? 'Organize cell ' : 'Cell ') + (panel.cell + 1);
  $('count').textContent = items.length + ' of 4 shortcuts';
  $('manage').hidden = $('back').hidden = editing;
  $('editor-actions').hidden = !editing;
  if (editing) renderSourcePicker();
  const spots = editing ? [0, 1, 2, 3] : items.map(item => item.slot);
  $('entries').replaceChildren(...spots.map(slot => {
    const item = items.find(entry => entry.slot === slot);
    if (!editing) {
      const card = button('', 'Open '+item.name, () => run(() => call('launch', { shortcutId:item.id })));
      card.className = 'card';
      const location = element('span', item.location, 'location');
      location.title = item.location;
      card.append(picture(item, thumbnails), element('strong', item.name), location);
      return card;
    }
    const row = element('div', '', item ? 'entry' : 'entry empty');
    row.dataset.selected = String(spotSelection?.slot === slot);
    row.dataset.slot = slot;
    if (!item) {
      row.append(button('＋ Add', 'Add to spot '+(slot + 1), () => changeSpot(slot)));
      return row;
    }
    const details = element('div'), controls = element('div', '', 'reorder');
    const name = element('input');
    name.type = 'text';
    name.value = item.name;
    name.maxLength = 120;
    name.setAttribute('aria-label', 'Name for spot '+(slot + 1));
    name.onchange = () => update('rename', { shortcutId:item.id, label:name.value });
    name.onkeydown = event => { if (event.key === 'Enter') name.blur(); };
    const location = element('span', item.location, 'location');
    location.title = item.location;
    details.append(name, location);
    const move = direction => update('move', { shortcutId:item.id, direction });
    const replace = button('↻ Replace', 'Replace shortcut in spot '+(slot + 1), () => changeSpot(slot, item));
    replace.className = 'replace';
    const up = button('↑', 'Move '+item.name+' to previous spot', () => move(-1));
    const down = button('↓', 'Move '+item.name+' to next spot', () => move(1));
    up.disabled = slot === 0;
    down.disabled = slot === 3;
    controls.append(replace, up, down, button('×', 'Remove '+item.name, () => update('remove', { shortcutId:item.id })));
    row.append(picture(item, thumbnails), details, controls);
    return row;
  }));
}

if (panel) {
  $('add-back').onclick = () => { spotSelection = undefined; renderPanel(); };
  $('manage').onclick = () => run(() => call('organize'));
  $('back').onclick = () => run(() => call('close-panel'));
  $('files').onclick = () => spotAction('pick');
  $('folder').onclick = () => spotAction('pick', { folder:true });
  $('drop').onclick = () => spotAction('drop');
  $('save').onclick = () => run(() => call('save-editor'));
  $('cancel').onclick = () => run(() => call('cancel-editor'));
  $('clear-cache').onclick = () => run(async () => {
    const result = await call('clear-thumbnails');
    renderPanel(false);
    notice('Cleared '+result.removed+' cached thumbnails.');
  });
  $('link-form').onsubmit = event => {
    event.preventDefault();
    spotAction('link', { url:$('url').value });
  };
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (spotSelection) {
      spotSelection = undefined;
      renderPanel();
    } else {
      run(() => call(panel.mode === 'editor' ? 'cancel-editor' : 'close-panel'));
    }
  });
}
function refresh() {
  return run(async () => {
    const next = await call('state');
    if (state && JSON.stringify(next) === JSON.stringify(state)) return;
    state = next;
    if (panel) renderPanel();
    else renderRail();
  });
}
snack.onChange(refresh);
refresh();
