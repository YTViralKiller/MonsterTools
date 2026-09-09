// Phaser 3 simple turn-based combat demo
// Injected into #phaser-root

(function(){
  // Wait until DOM is ready and Phaser script is loaded
  function ready(fn){
    if(document.readyState==='complete' || document.readyState==='interactive') fn(); else document.addEventListener('DOMContentLoaded',fn);
  }

  ready(function(){
    // If Phaser isn't loaded yet, dynamically load it then init
    if(typeof Phaser === 'undefined'){
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
      s.onload = initGame;
      document.head.appendChild(s);
    } else initGame();

    function initGame(){
      const WIDTH = 640, HEIGHT = 420;
      const config = {
        type: Phaser.AUTO,
        parent: 'phaser-root',
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: '#071028',
        scene: { preload, create }
      };

      const game = new Phaser.Game(config);

      function preload(){}

      function create(){
        const scene = this;

        // Simple background
        scene.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH-20, HEIGHT-20, 0x071028).setStrokeStyle(2, 0x0b2540);

        // Player and enemy containers
        const player = { maxHp: 100, hp: 100, x: 160, y: 260, name: 'Hero' };
        const enemy = { maxHp: 80, hp: 80, x: 480, y: 160, name: 'Goblin' };

        // Draw characters as circles
        const playerSprite = scene.add.circle(player.x, player.y, 48, 0x7c3aed).setStrokeStyle(4, 0x2b1650);
        const enemySprite = scene.add.circle(enemy.x, enemy.y, 48, 0x06b6d4).setStrokeStyle(4, 0x03474b);

        // Name labels
        scene.add.text(player.x, player.y+70, player.name, { font:'16px Arial', fill:'#ffffff' }).setOrigin(0.5);
        scene.add.text(enemy.x, enemy.y-70, enemy.name, { font:'16px Arial', fill:'#ffffff' }).setOrigin(0.5);

        // Health bars
        const hpBgP = scene.add.rectangle(player.x, player.y+40, 120, 14, 0x0b1220).setOrigin(0.5);
        const hpFillP = scene.add.rectangle(player.x - 60, player.y+40, 120, 14, 0xff5555).setOrigin(0,0.5);
        const hpTextP = scene.add.text(player.x, player.y+40, `${player.hp}/${player.maxHp}`, { font:'12px Arial', fill:'#fff' }).setOrigin(0.5);

        const hpBgE = scene.add.rectangle(enemy.x, enemy.y-40, 120, 14, 0x0b1220).setOrigin(0.5);
        const hpFillE = scene.add.rectangle(enemy.x - 60, enemy.y-40, 120, 14, 0x88ff88).setOrigin(0,0.5);
        const hpTextE = scene.add.text(enemy.x, enemy.y-40, `${enemy.hp}/${enemy.maxHp}`, { font:'12px Arial', fill:'#fff' }).setOrigin(0.5);

        // Game state
        let playerTurn = true;
        const logEl = document.getElementById('game-log');
        const attackBtn = document.getElementById('attack-btn');
        const healBtn = document.getElementById('heal-btn');

        function appendLog(msg){
          const p = document.createElement('div');
          p.textContent = msg;
          logEl.prepend(p);
        }

        function updateBars(){
          // player
          const pw = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1) * 120;
          hpFillP.width = pw;
          hpTextP.setText(`${player.hp}/${player.maxHp}`);
          // enemy
          const ew = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1) * 120;
          hpFillE.width = ew;
          hpTextE.setText(`${enemy.hp}/${enemy.maxHp}`);
        }

        function endCheck(){
          if(enemy.hp <= 0){
            appendLog('You defeated the enemy!');
            attackBtn.disabled = true; healBtn.disabled = true;
            return true;
          }
          if(player.hp <= 0){
            appendLog('You were defeated...');
            attackBtn.disabled = true; healBtn.disabled = true;
            return true;
          }
          return false;
        }

        function enemyAction(){
          // enemy simple AI: 75% attack, 25% small heal
          const roll = Math.random();
          if(roll < 0.75){
            const dmg = Phaser.Math.Between(6,14);
            player.hp = Math.max(0, player.hp - dmg);
            appendLog(`${enemy.name} hits you for ${dmg} damage.`);
            // flash player
            scene.tweens.add({ targets: playerSprite, scale:1.15, yoyo:true, duration:120 });
          } else {
            const heal = Phaser.Math.Between(6,12);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
            appendLog(`${enemy.name} heals ${heal} HP.`);
            scene.tweens.add({ targets: enemySprite, scale:1.08, yoyo:true, duration:120 });
          }
          updateBars();
          if(!endCheck()) playerTurn = true;
        }

        attackBtn.onclick = function(){
          if(!playerTurn) return;
          const dmg = Phaser.Math.Between(10,22);
          enemy.hp = Math.max(0, enemy.hp - dmg);
          appendLog(`You attack the ${enemy.name} for ${dmg} damage.`);
          scene.tweens.add({ targets: enemySprite, x: enemy.x - 8, yoyo:true, duration:120 });
          updateBars();
          playerTurn = false;
          if(!endCheck()) setTimeout(enemyAction, 700);
        };

        healBtn.onclick = function(){
          if(!playerTurn) return;
          const heal = Phaser.Math.Between(8,18);
          player.hp = Math.min(player.maxHp, player.hp + heal);
          appendLog(`You heal for ${heal} HP.`);
          scene.tweens.add({ targets: playerSprite, scale:1.08, yoyo:true, duration:120 });
          updateBars();
          playerTurn = false;
          setTimeout(enemyAction, 700);
        };

        // initial log
        appendLog('A wild ' + enemy.name + ' appears!');
        updateBars();

        // Expose simple reset for replay
        window._phaserGame = game;
      }
    }
  });
})();
