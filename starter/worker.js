const snack=window.SnackCondiment;snack.handleCommand('inspect',async()=>({instance:snack.context.instance,workspace:await snack.call('map'),note:(await snack.call('condiment-storage-get',{key:'note'})).value}));
// Add your own timers/service polling only when needed. The idle receiver has no loop.
