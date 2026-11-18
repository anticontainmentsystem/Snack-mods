(()=>{const api=window.SnackCondiment,$=s=>document.querySelector(s),status=$('#status'),compose=$('#compose');let sidebarGroup=null,sidebarChoices=new Set(),recipients=null,hiddenRooms=new Set(),showHidden=false,current=null,agents=[],selected=[],replyTo=null,pending=[],busy=false,refreshing=false,refreshTimer,renderKey='',emojiTarget=null,composerModelKey='',lastModels={},refreshAgain=false;const blobs=new Map(),pendingURLs=new Map();
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;},btn=(text,fn)=>{const b=el('button',text);b.type='button';b.addEventListener('click',()=>task(fn));return b;};async function task(fn){try{await fn();}catch(error){status.textContent=error.message;}}
let loadedHidden=false;
const drafts=new Map(),uploadedFiles=new WeakMap();
let navigation=0;
function draftKey(){return current?.id||'new:'+JSON.stringify([...(sidebarGroup||[])].sort());}
function saveDraft(){drafts.set(draftKey(),{text:compose.value,files:pending,replyTo,recipients});}
function showDraft(){
 const draft=drafts.get(draftKey());
 compose.value=draft?.text||'';pending=draft?.files||[];replyTo=draft?.replyTo||null;recipients=draft?.recipients??null;
 $('#reply-banner').hidden=!replyTo;
 if(replyTo)$('#reply-banner span').textContent='Reply to a message in this conversation';
 renderPending();
}
async function openConversation(id){
 const request=++navigation;
 const room=await api.call('chat-read',{roomId:id});
 if(request!==navigation)return;
 saveDraft();current=room;selected=[...room.participants];renderKey='';showDraft();await refresh();
}
async function refresh(){if(refreshing){refreshAgain=true;return;}refreshing=true;try{if(!loadedHidden){const saved=await api.call('condiment-storage-get',{key:'hidden-rooms'});hiddenRooms=new Set(Array.isArray(saved?.value)?saved.value:[]);loadedHidden=true;}const requestedRoomId=current?.id||null,request=navigation;const [summary,roster]=await Promise.all([api.call('chat-list'),api.call('chat-agents',current?{roomId:current.id}:{})]);if(request!==navigation||(current?.id||null)!==requestedRoomId){refreshAgain=true;return;}agents=roster.agents;const root=$('#rooms');root.replaceChildren();$('#sidebar-actions').replaceChildren();$('#sidebar-title').textContent=sidebarGroup?sidebarGroup.map(id=>agents.find(a=>a.id===id)?.name||'Unavailable agent').join(' + '):'Agents';$('#agent-search').hidden=!!sidebarGroup;$('#sidebar-back').hidden=!sidebarGroup;$('#new-room').hidden=!sidebarGroup;$('#hidden-rooms').hidden=!sidebarGroup;if(!sidebarGroup)renderSidebarAgents(root);for(const room of summary.rooms.filter(room=>sidebarGroup&&sameGroup(room.participants,sidebarGroup)&&hiddenRooms.has(room.id)===showHidden)){const b=btn('',()=>openConversation(room.id));b.className='room'+(current?.id===room.id?' active':'');b.append(el('strong',room.title),el('small',room.lastMessage||'Start a conversation'));root.append(b);}if(current&&!summary.rooms.some(room=>room.id===current.id)){
  navigation++;saveDraft();current=null;selected=[...(sidebarGroup||[])];showDraft();renderKey='';$('#messages').replaceChildren();$('#room-title').textContent='Simple Agent Chat';refreshAgain=true;return;
 }
 if(current){const fresh=await api.call('chat-read',{roomId:requestedRoomId});if(request!==navigation||current?.id!==requestedRoomId)return;current=fresh;selected=[...current.participants];$('#room-title').textContent=current.title;renderMessages();}renderComposerModels(roster);syncDialogModels(roster);renderRecipients();}finally{refreshing=false;if(refreshAgain){refreshAgain=false;clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh().catch(error=>status.textContent=error.message),0);}}}
function sameGroup(left,right){return left.length===right.length&&left.every(id=>right.includes(id));}
function renderSidebarAgents(root){
 const query=$('#agent-search').value.trim().toLowerCase();
 for(const agent of agents.filter(a=>a.name.toLowerCase().includes(query))){
  const label=el('label',undefined,'agent-choice'),box=el('input');box.type='checkbox';box.checked=sidebarChoices.has(agent.id);
  box.addEventListener('change',()=>{if(box.checked)sidebarChoices.add(agent.id);else sidebarChoices.delete(agent.id);open.disabled=!sidebarChoices.size;});
  const initials=agent.name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  const avatar=el('span',initials,'agent-avatar');avatar.setAttribute('aria-hidden','true');
  const identity=el('span',undefined,'agent-identity');
  identity.append(el('strong',agent.name),el('small',agent.externalConnectionId?(agent.connected?'Condiment agent':'Condiment disconnected'):agent.connected?'Available':'Offline'));
  label.append(box,avatar,identity);root.append(label);
 }
 const open=btn('Show conversations',async()=>{saveDraft();navigation++;sidebarGroup=[...sidebarChoices];if(current&&!sameGroup(current.participants,sidebarGroup)){current=null;renderKey='';replyTo=null;recipients=null;$('#reply-banner').hidden=true;$('#messages').replaceChildren();$('#room-title').textContent='Simple Agent Chat';}selected=[...sidebarGroup];showDraft();showHidden=false;await refresh();});
 open.disabled=!sidebarChoices.size;open.className='primary';$('#sidebar-actions').replaceChildren(open,btn('Manage agents',chooseAgents));
}
$('#agent-search').addEventListener('input',()=>{if(sidebarGroup)return;const root=$('#rooms');root.replaceChildren();renderSidebarAgents(root);});
$('#sidebar-back').addEventListener('click',()=>task(async()=>{saveDraft();navigation++;current=null;selected=[];renderKey='';$('#messages').replaceChildren();$('#room-title').textContent='Simple Agent Chat';sidebarGroup=null;showDraft();sidebarChoices.clear();showHidden=false;await refresh();}));
function renderRecipients(){
 const label=$('#participants'), picker=$('#send-to');
 const targets=selected.map(id=>({id,name:agents.find(a=>a.id===id)?.name||'Unavailable agent'}));
 if(recipients&&!recipients.every(id=>selected.includes(id)))recipients=[];
 const active=recipients??selected;
 label.textContent=targets.length?'In this chat: '+targets.map(t=>t.name).join(', '):'Choose agents for this conversation';
 const key=JSON.stringify(targets.map(t=>[t.id,t.name,active.includes(t.id)]));
 if(picker.dataset.key!==key){
  const focused=picker.contains(document.activeElement)?document.activeElement.dataset.recipientId:null;
  picker.replaceChildren();
  picker.dataset.key=key;
  for(const target of targets){
   const control=btn(target.name,()=>{
    const next=new Set(recipients??selected);
    if(next.has(target.id))next.delete(target.id);else next.add(target.id);
    recipients=[...next];
    renderRecipients();
   });
   control.dataset.recipientId=target.id;
   control.setAttribute('aria-pressed',String(active.includes(target.id)));
   picker.append(control);
   if(focused===target.id)control.focus({preventScroll:true});
  }
 }
 document.body.classList.toggle('choose-agents-first',!current&&!sidebarGroup);$('#recipient-summary').textContent=active.length?'Next message goes to '+targets.filter(t=>active.includes(t.id)).map(t=>t.name).join(', '):'No recipients selected';
 $('#hide-room').disabled=!current;$('#hide-room').textContent=current&&hiddenRooms.has(current.id)?'Restore chat':'Hide chat';
 $('#hidden-rooms').textContent=showHidden?'Show active chats':'Show hidden chats ('+hiddenRooms.size+')';
}
$('#hidden-rooms').addEventListener('click',()=>task(async()=>{showHidden=!showHidden;await refresh();}));
$('#hide-room').addEventListener('click',()=>task(async()=>{
 if(!current)return;
 saveDraft();navigation++;
 if(hiddenRooms.has(current.id))hiddenRooms.delete(current.id);
 else hiddenRooms.add(current.id);
 await api.call('condiment-storage-set',{key:'hidden-rooms',value:[...hiddenRooms]});
 current=null;showDraft();renderKey='';
 $('#reply-banner').hidden=true;$('#room-title').textContent='Simple Agent Chat';$('#messages').replaceChildren();
 await refresh();
}));
function renderMessages(){const key=JSON.stringify(current.messages);if(key===renderKey)return;renderKey=key;const root=$('#messages'),nearBottom=root.scrollHeight-root.scrollTop-root.clientHeight<90,scroll=root.scrollTop;root.replaceChildren();for(const m of current.messages){const article=el('article',undefined,'message '+m.role);article.id='message-'+m.id;const head=el('div',undefined,'message-head');head.append(el('strong',m.senderName),el('span',new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})));if(m.status==='working')head.append(el('span','Thinking…'));if(m.status==='failed'||m.status==='interrupted')head.append(el('span',m.status));article.append(head);if(m.replyTo){const original=current.messages.find(x=>x.id===m.replyTo);if(original){const quote=el('div',original.senderName+' · '+original.text,'quote');quote.addEventListener('click',()=>$('#message-'+original.id)?.scrollIntoView({block:'center',behavior:'smooth'}));article.append(quote);}}article.append(brandText(el('div',undefined,'message-body'),m.text|| (m.status==='working'?'…':'')));for(const file of m.files||[]){const card=btn('',()=>previewFile(file));card.className='file-card';card.append(el('span',file.mime.startsWith('image/')?'▧':file.mime.startsWith('video/')?'▷':file.mime.startsWith('audio/')?'♪':'▤'),el('span',file.name),el('small',formatSize(file.size)));article.append(card);if(file.mime.startsWith('image/')&&file.size<=10*1024*1024){const image=el('img');image.className='message-image';image.alt=file.name;article.append(image);loadBlob(file).then(url=>{if(image.isConnected)image.src=url;}).catch(error=>{if(image.isConnected){image.hidden=true;card.append(el('small','Preview unavailable: '+error.message));}});}}const actions=el('div',undefined,'message-actions');actions.append(btn('Copy',()=>api.call('chat-copy',{roomId:current.id,messageId:m.id})),btn('☺',()=>showEmoji(m.id)),btn('Reply',()=>{replyTo=m.id;$('#reply-banner').hidden=false;$('#reply-banner span').textContent='Reply to '+m.senderName+' · '+m.text.slice(0,100);compose.focus();}));article.append(actions);if(m.reactions.length){const reactions=el('div',undefined,'reactions'),counts=new Map();for(const r of m.reactions)counts.set(r.emoji,(counts.get(r.emoji)||0)+1);for(const [emoji,count]of counts)reactions.append(brandText(btn(emoji+' '+count,async()=>{await api.call('chat-react',{roomId:current.id,messageId:m.id,emoji});await refresh();}),emoji+' '+count));article.append(reactions);}root.append(article);}if(nearBottom)root.scrollTop=root.scrollHeight;else root.scrollTop=scroll;}
function formatSize(size){return size>1024*1024?(size/1024/1024).toFixed(1)+' MB':Math.max(1,Math.round(size/1024))+' KB';}
async function loadBlob(file,roomId=current?.id){const key=roomId+':'+file.id;if(blobs.has(key))return blobs.get(key);const chunks=[];for(let offset=0;offset<file.size;){const part=await api.call('chat-file',{roomId,id:file.id,offset}),raw=atob(part.data),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);chunks.push(bytes);if(part.next<=offset)break;offset=part.next;}const url=URL.createObjectURL(new Blob(chunks,{type:file.mime}));blobs.set(key,url);while(blobs.size>25){const [id,old]=blobs.entries().next().value;URL.revokeObjectURL(old);blobs.delete(id);}return url;}
async function previewFile(file){const roomId=current?.id;const root=$('#file-preview');root.replaceChildren();$('#file-name').textContent=file.name;$('#file-dialog').showModal();if(/^(image|audio|video)\//.test(file.mime)&&file.size<=30*1024*1024){const node=el(file.mime.startsWith('image/')?'img':file.mime.startsWith('audio/')?'audio':'video');node.className='media-preview';if(node.tagName!=='IMG')node.controls=true;root.append(el('small','Loading preview…'));node.src=await loadBlob(file,roomId);root.replaceChildren(node);}else{root.append(el('small','Inspecting file…'));const result=await api.call('chat-file-inspect',{roomId,id:file.id});root.replaceChildren(el('pre',result.text||result.note||'File shared with the conversation.','inspect-text'));}const download=btn('Download',async()=>{const a=el('a');a.download=file.name;a.href=await loadBlob(file,roomId);a.click();});root.append(download);}
function renderPending(){const root=$('#pending-files');for(const [file,url]of pendingURLs)if(!pending.includes(file)){URL.revokeObjectURL(url);pendingURLs.delete(file);}root.replaceChildren();for(const file of pending){const card=el('div',undefined,'pending-file');if(file.type.startsWith('image/')&&file.size<=10*1024*1024){let url=pendingURLs.get(file);if(!url){url=URL.createObjectURL(file);pendingURLs.set(file,url);}const image=el('img');image.src=url;image.alt=file.name;card.append(image);}card.append(btn(file.name+' ×',()=>{pending=pending.filter(f=>f!==file);renderPending();}));root.append(card);}}
async function upload(file){const begun=await api.call('media-begin',{name:file.name,mime:file.type||'application/octet-stream',size:file.size});for(let offset=0;offset<file.size;offset+=768*1024){const bytes=new Uint8Array(await file.slice(offset,offset+768*1024).arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));await api.call('media-chunk',{id:begun.id,offset,data:btoa(raw)});status.textContent=file.name+' · '+Math.round(Math.min(file.size,offset+bytes.length)/file.size*100)+'%';}return api.call('media-finish',{id:begun.id});}
async function send(){if(busy||!compose.value.trim()&&!pending.length)return;if(!current&&!sidebarGroup){status.textContent='Select agents in the sidebar and choose Show conversations first.';return;}if(!selected.length){status.textContent='Choose at least one chat participant before sending.';return;}if(recipients?.length===0){status.textContent='Choose who should receive this message.';return;}const targets=[...(recipients??selected)];const offline=targets.filter(id=>!agents.find(agent=>agent.id===id)?.connected);if(offline.length){status.textContent='Reconnect or remove '+offline.map(id=>agents.find(agent=>agent.id===id)?.name||'the unavailable agent').join(', ')+' before sending.';return;}busy=true;$('#send').disabled=true;const text=compose.value,attachments=[...pending],reply=replyTo,origin=draftKey(),request=navigation,existing=current,participants=[...selected];try{
 const room=existing||await createConversation(participants);
 if(!existing&&request===navigation)current=room;
 const files=[];
 for(const file of attachments){let id=uploadedFiles.get(file);if(!id){id=(await upload(file)).id;uploadedFiles.set(file,id);}files.push(id);}
 status.textContent='Sending…';
 const result=await api.call('chat-send',{roomId:room.id,text,attachments:files,replyTo:reply,recipients:targets});
 const saved=drafts.get(origin);if(saved?.text===text&&saved.files.length===attachments.length&&saved.files.every((file,index)=>file===attachments[index]))drafts.delete(origin);
 if(request===navigation&&compose.value===text&&pending.length===attachments.length&&pending.every((file,index)=>file===attachments[index])){current=room;compose.value='';pending=[];replyTo=null;$('#reply-banner').hidden=true;renderPending();}
 status.textContent=result.delivery.map(item=>(agents.find(agent=>agent.id===item.id)?.name||'Agent')+' · '+(item.error||({working:'responding','awaiting-agent':'waiting for external reply'}[item.status]||item.status))).join(' | ');
 await refresh();}finally{busy=false;$('#send').disabled=false;compose.focus();}}
function modelSelection(agent){return agent.modelSource==='conversation'||agent.modelSource==='agent'?agent.model:'';}
function syncDialogModels(state){for(const select of document.querySelectorAll('#agent-list select[data-model-agent]')){const agent=state.agents.find(a=>a.id===select.dataset.modelAgent);if(agent&&document.activeElement!==select){select.value=modelSelection(agent);const detail=select.closest('.agent-model-choice')?.querySelector('.agent-choice small');if(detail)detail.textContent=agent.detail;}}}
async function rememberModels(state){const method=state.connection.method,next={...lastModels,[method]:{...(lastModels[method]||{})}};for(const agent of state.agents.filter(a=>selected.includes(a.id)&&a.canSelectModel===true)){if(agent.effectiveModel)(next[agent.connectionKey||method]??={})[agent.id]=agent.effectiveModel;}if(JSON.stringify(next)!==JSON.stringify(lastModels)){lastModels=next;await api.call('condiment-storage-set',{key:'last-models',value:lastModels});}}
async function createConversation(participants=[...selected]){if(!participants.length)throw Error('Choose an agent before starting a conversation.');const room=await api.call('chat-create',{agents:participants}),state=await api.call('chat-agents',{roomId:room.id}),remembered=lastModels[state.connection.method]||{};for(const agent of state.agents.filter(a=>participants.includes(a.id)&&a.canSelectModel===true)){const model=(lastModels[agent.connectionKey]||remembered)[agent.id];if(model&&(agent.models||state.models).some(m=>(m.model||m.id)===model))await api.call('chat-agent-configure',{id:agent.id,model,roomId:room.id});}return api.call('chat-read',{roomId:room.id});}
async function setConversationModel(id,model,roomId=current?.id){const result=await api.call('chat-agent-configure',{id,model,...(roomId?{roomId}:{})});const agent=result.agents.find(a=>a.id===id),key=agent.connectionKey||agent.connectionMethod;lastModels[key]??={};if(model)lastModels[key][id]=model;else delete lastModels[key][id];await api.call('condiment-storage-set',{key:'last-models',value:lastModels});return result;}

function renderComposerModels(state){const targets=state.agents.filter(a=>selected.includes(a.id)&&a.canSelectModel===true),working=(current?.messages||[]).filter(m=>m.status==='working').map(m=>m.senderId),key=JSON.stringify({targets,models:state.models,method:state.connection?.method,working});if(key===composerModelKey)return;composerModelKey=key;const root=$('#composer-models');root.replaceChildren();if(!targets.length){root.append(el('small',selected.length?'':'Create or choose an agent to select its model.','muted'));return;}for(const agent of targets){const label=el('label',undefined,'composer-model'),name=el('span',agent.name);const select=el('select');select.dataset.modelAgent=agent.id;select.setAttribute('aria-label',agent.name+' composer model');select.title=agent.connectionLabel;select.add(new Option('Inherit Snack default ('+(agent.effectiveModel||'not set')+')',''));for(const model of agent.models||state.models||[])select.add(new Option((model.displayName||model.model||model.id)+(model.isDefault?' / default':''),model.model||model.id));select.value=modelSelection(agent);select.disabled=!agent.connected||!(agent.models||state.models)?.length||working.includes(agent.id);select.addEventListener('change',()=>task(async()=>{const previous=modelSelection(agent);select.disabled=true;try{await setConversationModel(agent.id,select.value);composerModelKey='';await refresh();status.textContent='Conversation model updated. Snack default unchanged.';}catch(error){select.value=previous;throw error;}finally{if(select.isConnected)select.disabled=false;}}));label.append(name,select);root.append(label);}}
function openAgentSettings(agent,fields=[]){
 $('#agent-connection-fields').replaceChildren(...fields);
 const dialog=$('#agent-settings'),input=$('#agent-instructions'),save=$('#save-agent-instructions'),feedback=$('#agent-settings-feedback');
 const previousPresets={direct:'Give clear, concise answers and prioritize the next action.',warm:'Use a friendly, conversational tone and explain the next step patiently.',analytical:'Check assumptions, compare options, and explain your reasoning clearly.',creative:'Offer original ideas and explore a few distinct approaches.'};
 $('#agent-settings-title').textContent=agent.name+' settings';
 input.value=Object.hasOwn(previousPresets,agent.personality)?previousPresets[agent.personality]:agent.personality;
 feedback.textContent='';
 save.onclick=async()=>{
  save.disabled=true;
  try{
   const result=await api.call('chat-agent-personality',{id:agent.id,personality:input.value});
   agent.personality=result.personality;
   input.value=result.personality;
   feedback.textContent='Instructions saved for '+agent.name+'.';
  }catch(error){feedback.textContent=error.message;}
  finally{save.disabled=false;}
 };
 dialog.showModal();
}
async function chooseAgents(){const list=await api.call('chat-agents',current?{roomId:current.id}:{});agents=list.agents;$('#agent-feedback').textContent='';const root=$('#agent-list');root.replaceChildren();const hint=el('p','Choose who receives messages in this conversation.','muted');root.append(hint);const external=el('details',undefined,'external-agent-list'),summary=el('summary','External agent clients');external.append(summary,el('p','Use these clients if they are listening for messages from Snack.','muted'));external.open=agents.some(a=>a.transport==='inbox'&&!a.externalConnectionId&&selected.includes(a.id));for(const agent of agents){const row=el('div',undefined,'agent-model-choice'),choice=el('label',undefined,'agent-choice'),check=el('input');check.type='checkbox';check.setAttribute('aria-label','Send chat messages to '+agent.name);check.value=agent.id;check.checked=selected.includes(agent.id);const copy=el('span');copy.append(el('strong',agent.name),el('small',agent.externalConnectionId?(agent.connected?'Connected through a Condiment':'Reconnect from the Condiment Store'):!agent.connected?'Disconnected · choose an available connection':agent.detail||agent.model||agent.transport));choice.append(check,copy);row.append(choice);if(agent.canSelectModel===true){const label=el('label',undefined,'agent-model-field');label.append(el('span','Model / '+(agent.connectionLabel||'Active Snack connection')));const select=el('select');select.setAttribute('aria-label',agent.name+' model');select.dataset.modelAgent=agent.id;select.add(new Option('Inherit Snack default ('+(agent.effectiveModel||'not set')+')',''));for(const model of agent.models||list.models||[])select.add(new Option((model.displayName||model.model||model.id)+(model.isDefault?' · default':''),model.model||model.id));select.value=modelSelection(agent);select.disabled=!agent.connected||!(agent.models||list.models)?.length;select.addEventListener('change',()=>task(async()=>{const previous=modelSelection(agent);select.disabled=true;try{const result=await setConversationModel(agent.id,select.value,null);agents=result.agents;const updated=agents.find(a=>a.id===agent.id);copy.querySelector('small').textContent=updated.detail;status.textContent='Model changed to '+updated.effectiveModel+' for the next message.';await refresh();}catch(error){select.value=previous;throw error;}finally{select.disabled=false;}}));label.append(select);const connectionLabel=el('label',undefined,'agent-model-field');connectionLabel.append(el('span','Provider account'));const connectionSelect=el('select');connectionSelect.setAttribute('aria-label',agent.name+' connection');for(const provider of list.providers||[])for(const connection of provider.connections.filter(c=>c.connected))connectionSelect.add(new Option(provider.name+' / '+connection.label,JSON.stringify({provider:provider.id,connectionId:connection.id})));connectionSelect.value=JSON.stringify({provider:agent.provider,connectionId:agent.connectionId});if(!connectionSelect.value){connectionSelect.insertBefore(new Option('Choose a connected account',''),connectionSelect.firstChild);connectionSelect.value='';}connectionSelect.addEventListener('change',()=>task(async()=>{if(!connectionSelect.value)return;await api.call('chat-agent-connection-set',{id:agent.id,...JSON.parse(connectionSelect.value)});$('#agent-settings').close();await chooseAgents();await refresh();}));connectionLabel.append(connectionSelect);row.append(btn('Settings',()=>openAgentSettings(agent,[label,connectionLabel])));}if(agent.transport==='inbox'&&!agent.externalConnectionId)external.append(row);else root.append(row);}if(agents.some(a=>a.transport==='inbox'&&!a.externalConnectionId))root.append(external);$('#add-model').hidden=!(list.providers||[]).some(p=>p.connections.some(c=>c.connected));if(!$('#agents-dialog').open)$('#agents-dialog').showModal();}
async function loadAgentModels(){const connection=JSON.parse($('#agent-provider').value),models=await api.call('chat-models',connection),select=$('#model');select.replaceChildren();for(const model of models)select.add(new Option(model.displayName||model.model||model.id,model.model||model.id));}
$('#agent-provider').addEventListener('change',()=>task(loadAgentModels));
$('#choose-agents').addEventListener('click',()=>task(chooseAgents));$('#apply-agents').addEventListener('click',async()=>{
 const button=$('#apply-agents'), feedback=$('#agent-feedback'), roomId=current?.id;
 const chosen=[...$('#agent-list').querySelectorAll('input:checked')].map(input=>input.value);
 button.disabled=true;
 feedback.textContent='';
 try{
   if(roomId){
     const updated=await api.call('chat-participants',{roomId,agents:chosen});
     if(current?.id===roomId)current=updated;if(sidebarGroup)sidebarGroup=[...chosen];
   }else{
     await api.call('chat-select-agents',{agents:chosen});sidebarGroup=chosen.length?[...chosen]:null;sidebarChoices=new Set(chosen);recipients=null;
   }
   selected=current?.id===roomId&&current?[...current.participants]:chosen;
   $('#agents-dialog').close();
   await refresh();
 }catch(error){
   feedback.textContent=error.message;
   status.textContent=error.message;
 }finally{
   button.disabled=false;
 }
});$('#add-model').addEventListener('click',()=>task(async()=>{const state=await api.call('chat-agents'),providers=$('#agent-provider');providers.replaceChildren();for(const provider of state.providers||[])for(const connection of provider.connections.filter(c=>c.connected))providers.add(new Option(provider.name+' / '+connection.label,JSON.stringify({provider:provider.id,connectionId:connection.id})));if(!providers.options.length)throw Error('Connect a provider in Snack Automation first.');await loadAgentModels();$('#model-form').hidden=false;}));$('#model-form').addEventListener('submit',event=>{event.preventDefault();task(async()=>{const result=await api.call('chat-agent-add',{name:$('#agent-name').value,model:$('#model').value,...JSON.parse($('#agent-provider').value)});agents=result.agents;$('#model-form').hidden=true;$('#agents-dialog').close();await chooseAgents();});});
$('#copy-transcript').addEventListener('click',()=>task(async()=>{if(!current)return;await api.call('chat-copy',{roomId:current.id});status.textContent='Conversation copied.';}));$('#new-room').addEventListener('click',()=>task(async()=>{saveDraft();const request=++navigation;const room=await createConversation(sidebarGroup||selected);if(request!==navigation)return;current=room;selected=[...room.participants];showDraft();$('#reply-banner').hidden=true;renderKey='';$('#messages').replaceChildren();await refresh();compose.focus();}));$('#send').addEventListener('click',()=>task(send));compose.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();task(send);}});$('#cancel-reply').addEventListener('click',()=>{replyTo=null;$('#reply-banner').hidden=true;});$('#stop').addEventListener('click',()=>task(async()=>{if(current){await api.call('chat-stop',{roomId:current.id});status.textContent='Snack-managed replies stopped. External runtimes manage their own cancellation.';await refresh();}}));$('#share-guides').addEventListener('click',()=>task(async()=>{if(!current)current=await createConversation();await api.call('chat-share-guides',{roomId:current.id,agents:selected});status.textContent='Optional Condiment guides added to the conversation.';await refresh();}));$('#attach').addEventListener('click',()=>$('#file').click());function addFiles(files){for(const file of files){if(file.size>100*1024*1024){status.textContent=file.name+' exceeds 100 MB.';continue;}if(pending.length<20)pending.push(file);}renderPending();}$('#file').addEventListener('change',()=>{addFiles($('#file').files);$('#file').value='';});document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>{e.preventDefault();addFiles(e.dataTransfer.files);});compose.addEventListener('paste',e=>{if(e.clipboardData.files.length){e.preventDefault();addFiles(e.clipboardData.files);}});
function brandText(node,text){node.replaceChildren();text.split(':snack:').forEach((part,i)=>{if(i){const mark=el('span',undefined,'snack-emoji');mark.setAttribute('role','img');mark.setAttribute('aria-label','Snack logo');node.append(mark);}node.append(document.createTextNode(part));});return node;}
const categories={Faces:'😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😋 😎 🤓 🤔 🤨 😐 🙄 😬 😮 😴 😢 😭 😤 😡 🤯 🥳',Gestures:'👍 👎 👏 🙌 🤝 🙏 💪 👋 ✋ ✌️ 🤞 🤟 👌 🤌 👀 🧠 💡',Snack:':snack: 🍿 🍕 🍔 🍟 🌮 🌯 🥟 🍜 🍣 🍱 🍪 🍩 🍫 🍭 🍎 🍋 🌶️ 🧂 🫙 ☕ 🍵',Symbols:'❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💯 🔥 ✨ ⭐ ✅ ❌ ⚠️ 🎉 🚀 🛠️ 🔗 📌 📎 🖼️ 🎵 🎬 💬'};function emojiCategory(name){const root=$('#emoji-grid');root.replaceChildren();for(const emoji of categories[name].split(' '))root.append(brandText(btn(emoji,async()=>{if(emojiTarget){await api.call('chat-react',{roomId:current.id,messageId:emojiTarget,emoji});await refresh();}else{const start=compose.selectionStart,end=compose.selectionEnd;compose.setRangeText(emoji,start,end,'end');compose.focus();}$('#emoji-dialog').close();}),emoji));}function showEmoji(messageId=null){emojiTarget=messageId;emojiCategory('Faces');$('#emoji-dialog').showModal();}for(const name of Object.keys(categories))$('#emoji-tabs').append(btn(name,()=>emojiCategory(name)));$('#emoji').addEventListener('click',()=>showEmoji());for(const dialog of document.querySelectorAll('dialog'))dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
api.onChange(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh().catch(error=>status.textContent=error.message),140);});(async()=>{lastModels=(await api.call('condiment-storage-get',{key:'last-models'})).value||{};const list=await api.call('chat-agents',current?{roomId:current.id}:{});agents=list.agents;for(const [alias,id]of Object.entries(list.aliases||{}))for(const saved of Object.values(lastModels)){if(saved[alias]&&!saved[id])saved[id]=saved[alias];delete saved[alias];}selected=list.selected.filter(id=>agents.some(a=>a.id===id&&a.connected));await refresh();})().catch(error=>status.textContent=error.message);
})();

api.handleCommand('copy-transcript',args=>api.call('chat-copy',args));
