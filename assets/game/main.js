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
      player: { name: 'Hero', level:1, xp:0, maxHp:120, hp:120, atk:12, gold:50, inventory: [] },
      enemies: [
        { id:'goblin', name:'Goblin', maxHp:60, atk:8, xp:12, gold:8 },
        { id:'skeleton', name:'Skeleton', maxHp:80, atk:10, xp:18, gold:12 },
        { id:'orc', name:'Orc', maxHp:120, atk:14, xp:30, gold:25 }
      ]
    };

    // Boot scene
    function BootScene(){ Phaser.Scene.call(this, { key:'BootScene' }); }
    BootScene.prototype = Object.create(Phaser.Scene.prototype);
    BootScene.prototype.constructor = BootScene;
    BootScene.prototype.preload = function(){
      // small font preload via CSS is fine; we draw shapes programmatically
    };
    BootScene.prototype.create = function(){
      // If saved state exists, load
      const saved = loadState();
      if(saved && saved.player) Object.assign(GameData.player, saved.player);
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

      const items = [ { id:'potion', name:'Small Potion', price:10, effect:{hp:30} }, { id:'bigp', name:'Big Potion', price:30, effect:{hp:80} } ];
      items.forEach((it, i)=>{
        const y = 140 + i*60;
        s.add.text(140,y,it.name + ' - ' + it.price + 'g', { font:'16px Arial', fill:'#dbeafe' }).setInteractive().on('pointerup', ()=>{
          if(GameData.player.gold >= it.price){ GameData.player.gold -= it.price; GameData.player.inventory.push(it.id); appendLog(`Bought ${it.name}`); saveState({player:GameData.player}); } else appendLog('Not enough gold');
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
      const list = GameData.player.inventory || [];
      if(list.length===0) s.add.text(W/2,160,'(empty)',{font:'16px Arial',fill:'#9ca3af'}).setOrigin(0.5);
      list.forEach((it,i)=>{
        const y = 140 + i*36;
        s.add.text(120,y,it, { font:'14px Arial', fill:'#dbeafe' }).setInteractive().on('pointerup', ()=>{
          // use item
          if(it==='potion'){ GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + 30); appendLog('Used Small Potion'); } else if(it==='bigp'){ GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + 80); appendLog('Used Big Potion'); }
          // remove first occurrence
          const idx = GameData.player.inventory.indexOf(it); if(idx>=0) GameData.player.inventory.splice(idx,1);
          saveState({player:GameData.player});
          s.scene.start('MenuScene');
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

      // Entities
      const player = Object.assign({}, GameData.player);

      // sprites
      const pSprite = s.add.rectangle(160,240,96,96,0x7c3aed).setStrokeStyle(3,0x2b1650);
      const eSprite = s.add.rectangle(480,180,96,96,0x06b6d4).setStrokeStyle(3,0x03474b);

      s.add.text(160,320, player.name, { font:'14px Arial', fill:'#fff' }).setOrigin(0.5);
      s.add.text(480,100, enemy.name, { font:'14px Arial', fill:'#fff' }).setOrigin(0.5);

      // HP bars
      const pBarBg = s.add.rectangle(160,200,140,16,0x0b1220).setOrigin(0.5);
      const pBar = s.add.rectangle(90,200,140,16,0xff5555).setOrigin(0,0.5);
      const pText = s.add.text(160,200,`${player.hp}/${player.maxHp}`,{font:'12px Arial',fill:'#fff'}).setOrigin(0.5);

      const eBarBg = s.add.rectangle(480,140,140,16,0x0b1220).setOrigin(0.5);
      const eBar = s.add.rectangle(410,140,140,16,0x88ff88).setOrigin(0,0.5);
      const eText = s.add.text(480,140,`${enemy.hp}/${enemy.maxHp}`,{font:'12px Arial',fill:'#fff'}).setOrigin(0.5);

      // connect DOM buttons
      const logEl = document.getElementById('game-log');
      function appendLog(msg){ const p = document.createElement('div'); p.textContent = msg; logEl.prepend(p); }

      const atkBtn = document.getElementById('attack-btn');
      const healBtn = document.getElementById('heal-btn');
      atkBtn.disabled = false; healBtn.disabled = false;

      function updateUI(){
        const pw = Phaser.Math.Clamp(player.hp/player.maxHp,0,1)*140; pBar.width = pw; pText.setText(`${player.hp}/${player.maxHp}`);
        const ew = Phaser.Math.Clamp(enemy.hp/enemy.maxHp,0,1)*140; eBar.width = ew; eText.setText(`${enemy.hp}/${enemy.maxHp}`);
      }

      function checkEnd(){
        if(enemy.hp<=0){ appendLog(`${enemy.name} defeated! You gain ${enemy.xp} XP and ${enemy.gold} gold.`); GameData.player.xp += enemy.xp; GameData.player.gold += enemy.gold; // level up
          if(GameData.player.xp >= GameData.player.level*30){ GameData.player.xp -= GameData.player.level*30; GameData.player.level++; GameData.player.maxHp += 8; GameData.player.atk += 2; appendLog('You leveled up!'); }
          // save
          GameData.player.hp = Math.min(GameData.player.maxHp, player.hp);
          saveState({player:GameData.player});
          atkBtn.disabled = true; healBtn.disabled = true; return true;
        }
        if(player.hp<=0){ appendLog('You were defeated...'); GameData.player.hp = 1; saveState({player:GameData.player}); atkBtn.disabled=true; healBtn.disabled=true; return true; }
        return false;
      }

      function enemyTurn(){
        const roll = Math.random();
        if(roll<0.8){ const dmg = Phaser.Math.Between(enemy.atk-3, enemy.atk+3); player.hp = Math.max(0, player.hp - dmg); appendLog(`${enemy.name} hits you for ${dmg}.`); s.tweens.add({targets:pSprite, scale:1.08, yoyo:true, duration:120}); }
        else { const heal = Phaser.Math.Between(6,14); enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); appendLog(`${enemy.name} heals ${heal}.`); }
        updateUI();
        checkEnd();
      }

      atkBtn.onclick = function(){
        if(atkBtn.disabled) return;
        const dmg = Phaser.Math.Between(player.atk-4, player.atk+6);
        enemy.hp = Math.max(0, enemy.hp - dmg);
        appendLog(`You hit ${enemy.name} for ${dmg}.`);
        s.tweens.add({targets:eSprite, x:enemy.x-6, yoyo:true, duration:120});
        updateUI();
        if(!checkEnd()) setTimeout(enemyTurn, 700);
      };

      healBtn.onclick = function(){
        if(healBtn.disabled) return;
        const heal = Phaser.Math.Between(12,28);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        appendLog(`You heal ${heal} HP.`);
        s.tweens.add({targets:pSprite, scale:1.06, yoyo:true, duration:120});
        updateUI();
        setTimeout(enemyTurn,700);
      };

      // initial messages
      appendLog(`A ${enemy.name} appears!`);
      updateUI();

      // on exit, apply player hp back to GameData
      this.events.on('shutdown', function(){ GameData.player.hp = player.hp; saveState({player:GameData.player}); });
    };

    // Helper to append to DOM log from scenes
    function appendLog(msg){ const log = document.getElementById('game-log'); if(log){ const p=document.createElement('div'); p.textContent=msg; log.prepend(p); } }

  }

})();
