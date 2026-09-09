// Phaser 3 simple turn-based combat demo
// Injected into #phaser-root

// Full game implementation (Phaser 3) - expanded RPG prototype
// Usage: loaded dynamically by index.html showGame();

(function(){
  function ready(fn){
    if(document.readyState==='complete' || document.readyState==='interactive') fn(); else document.addEventListener('DOMContentLoaded',fn);
  }

  ready(function(){
    if(typeof Phaser === 'undefined'){
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
      s.onload = initGame;
      document.head.appendChild(s);
    } else initGame();
  });

  function initGame(){
    const W = 640, H = 420;
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-root',
      width: W,
      height: H,
      backgroundColor: '#071028',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [BootScene, MenuScene, WorldScene, TownScene, BattleScene, InventoryScene]
    };

    // Audio helper (simple beeps) and mute state
    const AudioHelper = (function(){
      let ctx = null; let muted = false;
      function ensure(){ if(!ctx) try{ ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ ctx = null; } }
      function beep(freq, time){ if(muted) return; ensure(); if(!ctx) return; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime+0.01); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+ (time||0.12)); o.stop(ctx.currentTime + (time||0.12) + 0.02); }
      return { beep:beep, toggle:function(){ muted=!muted; return muted; }, setMuted:function(v){ muted=!!v; } };
    })();

    // expose basic controls to window for DOM buttons
    window.gameControls = {
      save:function(){ try{ const st = { player: GameData.player }; localStorage.setItem('ultr_game_save_v1', JSON.stringify(st)); appendLog('Game saved.'); return true;}catch(e){appendLog('Save failed.'); return false;} },
      load:function(){ try{ const s = localStorage.getItem('ultr_game_save_v1'); if(!s){ appendLog('No saved game found.'); return false; } const obj = JSON.parse(s); if(obj.player) { Object.assign(GameData.player, obj.player); appendLog('Game loaded.'); return true; } }catch(e){ appendLog('Load failed.'); } return false; },
      restart:function(){ try{ localStorage.removeItem('ultr_game_save_v1'); location.reload(); }catch(e){ location.reload(); } },
      toggleMute:function(){ const m = AudioHelper.toggle(); appendLog(m? 'Audio muted':'Audio unmuted'); return m; }
    };

    const game = new Phaser.Game(config);
    window._phaserGame = game;

    // Simple persistent storage helper
    const SAVE_KEY = 'ultr_game_save_v1';
    function saveState(state){
      try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){}
    }
    function loadState(){
      try{ const s = localStorage.getItem(SAVE_KEY); return s?JSON.parse(s):null; }catch(e){return null}
    }

    // Shared game data
    const GameData = {
      // Items catalog
      items: {
        potion: { id:'potion', name:'Small Potion', type:'consumable', effect:{hp:30}, price:10 },
        bigp: { id:'bigp', name:'Big Potion', type:'consumable', effect:{hp:80}, price:30 },
        rustysword: { id:'rustysword', name:'Rusty Sword', type:'weapon', atk:6, price:40 }
      },
      player: { name: 'Hero', level:1, xp:0, maxHp:120, hp:120, baseAtk:12, gold:50, inventory: [], equipment: { weapon: null } },
      enemies: [
        { id:'goblin', name:'Goblin', maxHp:60, atk:8, xp:12, gold:8, drops:[{id:'potion',name:'Small Potion',chance:0.5}] },
        { id:'skeleton', name:'Skeleton', maxHp:80, atk:10, xp:18, gold:12, drops:[{id:'potion',name:'Small Potion',chance:0.4}] },
        { id:'orc', name:'Orc', maxHp:120, atk:14, xp:30, gold:25, drops:[{id:'bigp',name:'Big Potion',chance:0.35},{id:'rustysword',name:'Rusty Sword',chance:0.12}] },
        { id:'wyrm', name:'Wyrm', maxHp:200, atk:20, xp:70, gold:60, drops:[{id:'wyrm-scale',name:'Wyrm Scale',chance:0.25},{id:'bigp',name:'Big Potion',chance:0.5}] }
      ],
      quests: [ { id:'hunt1',name:'Goblin Hunt',target:'goblin',count:3,progress:0,reward:{gold:30,xp:20} } ]
    };

    // Helper: compute player's effective attack including equipped weapon
    function getPlayerAtk(player){
      let atk = player.baseAtk || 0;
      if(player.equipment && player.equipment.weapon){
        const it = GameData.items[player.equipment.weapon];
        if(it && it.atk) atk += it.atk;
      }
      return atk;
    }

    // Boot scene
    function BootScene(){ Phaser.Scene.call(this, { key:'BootScene' }); }
    BootScene.prototype = Object.create(Phaser.Scene.prototype);
    BootScene.prototype.constructor = BootScene;
    BootScene.prototype.preload = function(){
      // create programmatic textures if assets helper exists
      try{
        if(window.GameAssets && typeof window.GameAssets.createCharacterTextures === 'function'){
          window.GameAssets.createCharacterTextures(this);
        }
      }catch(e){ console.warn('GameAssets not available', e); }
    };
    BootScene.prototype.create = function(){
      // If saved state exists, load
      const saved = loadState();
      if(saved && saved.player) Object.assign(GameData.player, saved.player);
      // Ensure equipment structure
      if(!GameData.player.equipment) GameData.player.equipment = { weapon: null };
      this.scene.start('MenuScene');
    };

    // Menu scene
    function MenuScene(){ Phaser.Scene.call(this, { key:'MenuScene' }); }
    MenuScene.prototype = Object.create(Phaser.Scene.prototype);
    MenuScene.prototype.constructor = MenuScene;
    MenuScene.prototype.create = function(){
      const s = this;
      s.add.rectangle(W/2, H/2, W-20, H-20, 0x071028).setStrokeStyle(2,0x123a52);
      s.add.text(W/2, 80, 'UlterMonster: Arena', { font:'28px Arial', fill:'#fff' }).setOrigin(0.5);

      const start = s.add.text(W/2, 170, 'Enter World', { font:'20px Arial', fill:'#dbeafe', backgroundColor:'rgba(0,0,0,0.12)' }).setOrigin(0.5).setPadding(10).setInteractive();
      start.on('pointerup', ()=> s.scene.start('WorldScene'));

      const inv = s.add.text(W/2, 230, 'Inventory', { font:'18px Arial', fill:'#9ca3af' }).setOrigin(0.5).setInteractive();
      inv.on('pointerup', ()=> s.scene.start('InventoryScene'));

      const loadBtn = s.add.text(W/2, 290, 'Save/Load (auto)', { font:'14px Arial', fill:'#9ca3af' }).setOrigin(0.5);

      // small status
      const p = GameData.player;
      s.add.text(W/2, 340, `Level ${p.level} • HP ${p.hp}/${p.maxHp} • XP ${p.xp} • Gold ${p.gold}`, { font:'14px Arial', fill:'#dbeafe' }).setOrigin(0.5);
    };

    // World scene with simple nav
    function WorldScene(){ Phaser.Scene.call(this,{key:'WorldScene'}); }
    WorldScene.prototype = Object.create(Phaser.Scene.prototype);
    WorldScene.prototype.constructor = WorldScene;
    WorldScene.prototype.create = function(){
      const s = this;
      s.add.rectangle(W/2,H/2,W-20,H-20,0x071028).setStrokeStyle(2,0x123a52);
      s.add.text(W/2,60,'World Map', { font:'22px Arial', fill:'#fff' }).setOrigin(0.5);

      const arena = s.add.text(W/2,150,'Arena (Fight)', { font:'20px Arial', fill:'#ffddaa' }).setOrigin(0.5).setInteractive();
      arena.on('pointerup', ()=> s.scene.start('BattleScene', { mode:'arena' }) );

      const town = s.add.text(W/2,210,'Town (Shop)', { font:'20px Arial', fill:'#aaf0c4' }).setOrigin(0.5).setInteractive();
      town.on('pointerup', ()=> s.scene.start('TownScene'));

      const back = s.add.text(W/2,320,'Back to Menu', { font:'16px Arial', fill:'#9ca3af' }).setOrigin(0.5).setInteractive();
      back.on('pointerup', ()=> s.scene.start('MenuScene'));
    };

    // Town scene (simple shop)
    function TownScene(){ Phaser.Scene.call(this,{key:'TownScene'}); }
    TownScene.prototype = Object.create(Phaser.Scene.prototype);
    TownScene.prototype.constructor = TownScene;
    TownScene.prototype.create = function(){
      const s = this;
      s.add.rectangle(W/2,H/2,W-20,H-20,0x071028).setStrokeStyle(2,0x123a52);
      s.add.text(W/2,60,'Town', { font:'22px Arial', fill:'#fff' }).setOrigin(0.5);

      // show items from catalog
      const list = Object.values(GameData.items);
      list.forEach((it, i)=>{
        const y = 140 + i*60;
        s.add.text(140,y,`${it.name} - ${it.price}g`, { font:'16px Arial', fill:'#dbeafe' }).setInteractive().on('pointerup', ()=>{
          if(GameData.player.gold >= it.price){ GameData.player.gold -= it.price; GameData.player.inventory.push(it.id); appendLog(`Bought ${it.name}`); saveState({player:GameData.player}); updateSidebar(); } else appendLog('Not enough gold');
        });
      });

      s.add.text(W/2,340,'Return', { font:'16px Arial', fill:'#9ca3af' }).setOrigin(0.5).setInteractive().on('pointerup', ()=> s.scene.start('WorldScene'));
    };

    // Inventory scene (view items)
    function InventoryScene(){ Phaser.Scene.call(this, { key:'InventoryScene' }); }
    InventoryScene.prototype = Object.create(Phaser.Scene.prototype);
    InventoryScene.prototype.constructor = InventoryScene;
    InventoryScene.prototype.create = function(){
      const s = this;
      s.add.rectangle(W/2,H/2,W-20,H-20,0x071028).setStrokeStyle(2,0x123a52);
      s.add.text(W/2,60,'Inventory', { font:'22px Arial', fill:'#fff' }).setOrigin(0.5);
      const inv = GameData.player.inventory || [];
      if(inv.length===0) s.add.text(W/2,160,'(empty)',{font:'16px Arial',fill:'#9ca3af'}).setOrigin(0.5);
      // compute counts
      const counts = {};
      inv.forEach(id=> counts[id] = (counts[id]||0) + 1 );
      const entries = Object.keys(counts);
      entries.forEach((id,i)=>{
        const item = GameData.items[id] || { id:id, name:id };
        const y = 140 + i*40;
        const line = s.add.text(120,y,`${item.name} x${counts[id]}`, { font:'14px Arial', fill:'#dbeafe' }).setInteractive();
        // action text
        const action = item.type === 'weapon' ? 'Equip' : 'Use';
        const btn = s.add.text(420,y, action, { font:'14px Arial', fill:'#9ca3af', backgroundColor:'rgba(0,0,0,0.08)' }).setInteractive();
        btn.on('pointerup', ()=>{
          if(item.type === 'weapon'){
            GameData.player.equipment.weapon = item.id;
            appendLog(`Equipped ${item.name}`);
            saveState({player:GameData.player});
            s.scene.start('MenuScene');
          } else if(item.id === 'potion'){
            GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + item.effect.hp);
            appendLog(`Used ${item.name}`);
            // remove one
            const idx = GameData.player.inventory.indexOf(item.id); if(idx>=0) GameData.player.inventory.splice(idx,1);
            saveState({player:GameData.player});
            s.scene.start('MenuScene');
          } else if(item.id === 'bigp'){
            GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + item.effect.hp);
            appendLog(`Used ${item.name}`);
            const idx = GameData.player.inventory.indexOf(item.id); if(idx>=0) GameData.player.inventory.splice(idx,1);
            saveState({player:GameData.player});
            s.scene.start('MenuScene');
          }
        });
      });
      s.add.text(W/2,360,'Back', { font:'14px Arial', fill:'#9ca3af' }).setOrigin(0.5).setInteractive().on('pointerup', ()=> s.scene.start('MenuScene'));
    };

    // Battle scene - turn based
    function BattleScene(){ Phaser.Scene.call(this, { key:'BattleScene' }); }
    BattleScene.prototype = Object.create(Phaser.Scene.prototype);
    BattleScene.prototype.constructor = BattleScene;
    BattleScene.prototype.init = function(data){ this.mode = data.mode || 'arena'; };
    BattleScene.prototype.create = function(){
      const s = this; s.add.rectangle(W/2,H/2,W-20,H-20,0x071028).setStrokeStyle(2,0x123a52);
      s.add.text(W/2,22,'Battle', { font:'20px Arial', fill:'#fff' }).setOrigin(0.5);

      // pick enemy
      const enemyTemplate = Phaser.Utils.Array.GetRandom(GameData.enemies);
      const enemy = Object.assign({}, enemyTemplate);
      // ensure runtime hp value
      enemy.hp = enemy.maxHp;

      // Entities
      const player = Object.assign({}, GameData.player);
      player.atk = getPlayerAtk(GameData.player);
      if (typeof player.hp === 'undefined' || player.hp === null) player.hp = player.maxHp;

      // sprites (use generated textures if present)
      let pSprite, eSprite;
      if(s.textures.exists('char-player')){
        pSprite = s.add.image(160,240,'char-player').setDisplaySize(96,96);
      } else {
        pSprite = s.add.rectangle(160,240,96,96,0x7c3aed).setStrokeStyle(3,0x2b1650);
      }
      if(s.textures.exists('char-enemy')){
        eSprite = s.add.image(480,180,'char-enemy').setDisplaySize(96,96);
      } else {
        eSprite = s.add.rectangle(480,180,96,96,0x06b6d4).setStrokeStyle(3,0x03474b);
      }

      // expose positions for tweens/emitter logic
      player.x = pSprite.x; player.y = pSprite.y;
      enemy.x = eSprite.x; enemy.y = eSprite.y;

      s.add.text(160,320, player.name, { font:'14px Arial', fill:'#fff' }).setOrigin(0.5);
      s.add.text(480,100, enemy.name, { font:'14px Arial', fill:'#fff' }).setOrigin(0.5);

      // HP bars
      const pBarBg = s.add.rectangle(160,200,140,16,0x0b1220).setOrigin(0.5);
      const pBar = s.add.rectangle(90,200,140,16,0xff5555).setOrigin(0,0.5);
      const pText = s.add.text(160,200,`${player.hp}/${player.maxHp}`,{font:'12px Arial',fill:'#fff'}).setOrigin(0.5);

      const eBarBg = s.add.rectangle(480,140,140,16,0x0b1220).setOrigin(0.5);
      const eBar = s.add.rectangle(410,140,140,16,0x88ff88).setOrigin(0,0.5);
      const initialEnemyHp = (typeof enemy.hp === 'number') ? enemy.hp : enemy.maxHp;
      const eText = s.add.text(480,140,`${initialEnemyHp}/${enemy.maxHp}`,{font:'12px Arial',fill:'#fff'}).setOrigin(0.5);

      // connect DOM buttons
      const logEl = document.getElementById('game-log');
      function appendLog(msg){ const p = document.createElement('div'); p.textContent = msg; logEl.prepend(p); }

      const atkBtn = document.getElementById('attack-btn');
      const healBtn = document.getElementById('heal-btn');
      atkBtn.disabled = false; healBtn.disabled = false;

      function updateUI(){
        const pHp = Number(player.hp) || 0;
        const pw = Phaser.Math.Clamp(pHp/player.maxHp,0,1)*140; pBar.width = pw; pText.setText(`${pHp}/${player.maxHp}`);
        const eHp = (typeof enemy.hp === 'number') ? enemy.hp : Number(enemy.hp) || enemy.maxHp;
        const ew = Phaser.Math.Clamp(eHp/enemy.maxHp,0,1)*140; eBar.width = ew; eText.setText(`${eHp}/${enemy.maxHp}`);
      }

      function checkEnd(){
        if(enemy.hp<=0){ appendLog(`${enemy.name} defeated! You gain ${enemy.xp} XP and ${enemy.gold} gold.`); GameData.player.xp += enemy.xp; GameData.player.gold += enemy.gold; // level up
          if(GameData.player.xp >= GameData.player.level*30){ GameData.player.xp -= GameData.player.level*30; GameData.player.level++; GameData.player.maxHp += 8; GameData.player.atk += 2; appendLog('You leveled up!'); }
          // handle drops
          if(enemy.drops && enemy.drops.length){
            enemy.drops.forEach(d=>{
              if(Math.random() < d.chance){ GameData.player.inventory.push(d.id); appendLog(`Found item: ${d.name}`); }
            });
          }
          // quest progression
          GameData.quests.forEach(q=>{
            if(q.target===enemy.id && q.progress < q.count){ q.progress++; appendLog(`Quest '${q.name}': ${q.progress}/${q.count}`); if(q.progress>=q.count){ GameData.player.gold += q.reward.gold; GameData.player.xp += q.reward.xp; appendLog(`Quest complete! Reward: ${q.reward.gold}g, ${q.reward.xp} XP`); } }
          });
          // save
          GameData.player.hp = Math.min(GameData.player.maxHp, player.hp);
          saveState({player:GameData.player, quests:GameData.quests});
          atkBtn.disabled = true; healBtn.disabled = true; return true;
        }
        if(player.hp<=0){ appendLog('You were defeated...'); GameData.player.hp = 1; saveState({player:GameData.player}); atkBtn.disabled=true; healBtn.disabled=true; return true; }
        return false;
      }

      function enemyTurn(){
        const roll = Math.random();
        if(roll<0.8){ const dmg = Phaser.Math.Between(enemy.atk-3, enemy.atk+3); player.hp = Math.max(0, player.hp - dmg); appendLog(`${enemy.name} hits you for ${dmg}.`); s.tweens.add({targets:pSprite, scale:1.08, yoyo:true, duration:120}); }
        else { const heal = Phaser.Math.Between(6,14); enemy.hp = Math.min(enemy.maxHp, (Number(enemy.hp)||0) + heal); appendLog(`${enemy.name} heals ${heal}.`); }
        updateUI();
        checkEnd();
      }

      // define player action handlers and create canvas buttons
      function playerAttack(){
        if(atkBtn.disabled) return;
        const dmg = Phaser.Math.Between(player.atk-4, player.atk+6);
        enemy.hp = Math.max(0, (Number(enemy.hp)||enemy.maxHp) - dmg);
        appendLog(`You hit ${enemy.name} for ${dmg}.`);
        s.tweens.add({targets:eSprite, x:enemy.x-6, yoyo:true, duration:120});
        try{ if(s.add.particles){ const parts = s.add.particles('char-enemy') ; const emitter = parts.createEmitter({ x: enemy.x, y: enemy.y, speed: { min: 40, max: 120 }, angle: { min: 0, max: 360 }, lifespan: 400, scale: { start: 0.5, end: 0 }, blendMode: 'ADD', quantity: 6 }); s.time.delayedCall(300, ()=>{ emitter.stop(); parts.destroy(); }); } }catch(e){}
        AudioHelper.beep(520,0.08);
        updateUI();
        if(!checkEnd()) setTimeout(enemyTurn, 700);
      }

      function playerHeal(){
        if(healBtn.disabled) return;
        const heal = Phaser.Math.Between(12,28);
        player.hp = Math.min(player.maxHp, Number(player.hp) + heal);
        appendLog(`You heal ${heal} HP.`);
        s.tweens.add({targets:pSprite, scale:1.06, yoyo:true, duration:120});
        AudioHelper.beep(360,0.12);
        updateUI();
        setTimeout(enemyTurn,700);
      }

      // wire DOM buttons to these handlers
      atkBtn.onclick = playerAttack;
      healBtn.onclick = playerHeal;

      // create in-canvas buttons for attack/heal
      const btnStyle = { font:'16px Arial', fill:'#fff', backgroundColor:'rgba(7,22,48,0.6)', padding:{x:8,y:6} };
      const attackText = s.add.text(W/2-80, H-60, 'Attack', btnStyle).setOrigin(0.5).setInteractive();
      const healText = s.add.text(W/2+80, H-60, 'Heal', btnStyle).setOrigin(0.5).setInteractive();
      attackText.on('pointerup', playerAttack);
      healText.on('pointerup', playerHeal);
      // hide DOM buttons while in-battle to avoid UI duplication
      if(atkBtn) atkBtn.style.display = 'none';
      if(healBtn) healBtn.style.display = 'none';

      // initial messages
      appendLog(`A ${enemy.name} appears!`);
      updateUI();

      // on exit, apply player hp back to GameData
      this.events.on('shutdown', function(){ GameData.player.hp = player.hp; saveState({player:GameData.player});
        // restore DOM buttons
        try{ var atk=document.getElementById('attack-btn'), heal=document.getElementById('heal-btn'); if(atk) atk.style.display=''; if(heal) heal.style.display=''; }catch(e){}
      });
    };

    // Helper to append to DOM log from scenes
    function appendLog(msg){ const log = document.getElementById('game-log'); if(log){ const p=document.createElement('div'); p.textContent=msg; log.prepend(p); } }

    // Expose quest and inventory helpers to global for quick UI checks
    window._gameProbe = {
      getPlayer:function(){ return GameData.player; },
      getQuests:function(){ return GameData.quests; }
    };

    // Update sidebar stats in the DOM
    function updateSidebar(){
      try{
        var stat = document.getElementById('player-stats');
        if(!stat) return;
        var p = GameData.player;
        var equipName = p.equipment && p.equipment.weapon ? (GameData.items[p.equipment.weapon] && GameData.items[p.equipment.weapon].name) : '(none)';
        stat.innerHTML = `<div style="color:var(--muted);font-size:13px">HP: ${p.hp}/${p.maxHp}</div><div style="color:var(--muted);font-size:13px">ATK: ${getPlayerAtk(p)}</div><div style="color:var(--muted);font-size:13px">Gold: ${p.gold}</div><div style="color:var(--muted);font-size:13px">Equipped: ${equipName}</div>`;
      }catch(e){}
    }

    // call updateSidebar periodically and after changes
    setInterval(updateSidebar, 1000);

  }

})();
