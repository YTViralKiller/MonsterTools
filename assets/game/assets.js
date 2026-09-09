// Helper to generate simple character textures and UI palette for the embedded game
// Uses Phaser drawing API to create textures for use in scenes. Draws stylized helmets/faces to look like RPG sprites.
(function(){
  window.GameAssets = {
    palette: {
      bg: 0x071028,
      panel: 0x0b1220,
      primary: 0x7c3aed,
      accent: 0x06b6d4,
      health: 0xff5555,
      heal: 0x88ff88,
      text: '#dbeafe'
    },

    createCharacterTextures: function(scene){
      const w = 96, h = 96;
      const g = scene.make.graphics({x:0,y:0,add:false});

      // Player: draw helmet, face, eyes, trim, and a small sword silhouette
      g.clear();
      // helmet base
      g.fillStyle(0x6f3bd6,1);
      g.fillCircle(w/2, h/2, 42);
      // visor
      g.fillStyle(0x2b1650,1);
      g.fillEllipse(w/2, h/2+4, 68, 36);
      // eye slits (light)
      g.fillStyle(0xffffff,0.9);
      g.fillRect(w/2 - 18, h/2 - 6, 14, 6);
      g.fillRect(w/2 + 4, h/2 - 6, 14, 6);
      // cheek highlight
      g.fillStyle(0xffffff,0.06);
      g.fillCircle(w/2 - 10, h/2 - 10, 8);
      // armor band
      g.fillStyle(0x2b1650,1);
      g.fillRect(14, h/2 + 22, w-28, 10);
      // small sword icon overlay
      g.fillStyle(0xffe8a6,1);
      g.fillRect(w-22, h-34, 4, 18);
      g.fillTriangle(w-24, h-34, w-18, h-34, w-21, h-40);
      g.generateTexture('char-player', w, h);

      // Enemy: wyrm-like accent color with eyes and teeth
      g.clear();
      g.fillStyle(0x06b6d4,1);
      g.fillEllipse(w/2, h/2 - 2, 80, 64);
      // crest
      g.fillStyle(0x0b8f7f,1);
      g.fillTriangle(w/2 - 30, h/2 - 18, w/2, h/2 - 48, w/2 + 30, h/2 - 18);
      // eyes
      g.fillStyle(0xffffff,1);
      g.fillRect(w/2 - 18, h/2 - 10, 12, 6);
      g.fillRect(w/2 + 6, h/2 - 10, 12, 6);
      // pupils
      g.fillStyle(0x0b2540,1);
      g.fillRect(w/2 - 14, h/2 - 8, 6, 4);
      g.fillRect(w/2 + 10, h/2 - 8, 6, 4);
      // teeth
      g.fillStyle(0xffffff,1);
      g.fillTriangle(w/2 - 8, h/2 + 8, w/2 - 2, h/2 + 2, w/2 - 2, h/2 + 12);
      g.fillTriangle(w/2 + 2, h/2 + 8, w/2 + 8, h/2 + 2, w/2 + 2, h/2 + 12);
      g.generateTexture('char-enemy', w, h);

      g.destroy();
    }
  };
})();
