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

      // Player: draw a simple body, helmet, and weapon silhouette to look more like a character
      g.clear();
      // body
      g.fillStyle(0x8653ff,1);
      g.fillRoundedRect(w/2-26, h/2-6, 52, 64, 8);
      // helmet
      g.fillStyle(0x6f3bd6,1);
      g.fillEllipse(w/2, h/2-24, 56, 40);
      g.fillStyle(0x2b1650,1);
      g.fillRect(w/2-20, h/2-30, 40, 14);
      // eyes
      g.fillStyle(0xffffff,1);
      g.fillRect(w/2 - 14, h/2 - 28, 10, 6);
      g.fillRect(w/2 + 4, h/2 - 28, 10, 6);
      // sword on back
      g.fillStyle(0xffe8a6,1);
      g.fillRect(w/2+18, h/2+4, 6, 36);
      g.fillTriangle(w/2+14, h/2+4, w/2+26, h/2+4, w/2+20, h/2-4);
      g.generateTexture('char-player', w, h);

      // Enemy: wyrm-like accent color with eyes and teeth
      g.clear();
      // enemy body
      g.fillStyle(0x07c4d9,1);
      g.fillRoundedRect(w/2-28, h/2-12, 56, 72, 10);
      // head crest
      g.fillStyle(0x06a6b0,1);
      g.fillTriangle(w/2-28, h/2-24, w/2, h/2-56, w/2+28, h/2-24);
      // eyes
      g.fillStyle(0xffffff,1);
      g.fillRect(w/2 - 12, h/2 - 8, 12, 6);
      g.fillRect(w/2 + 2, h/2 - 8, 12, 6);
      // fangs
      g.fillStyle(0xffffff,1);
      g.fillTriangle(w/2 - 6, h/2 + 8, w/2 - 2, h/2 + 2, w/2 - 2, h/2 + 12);
      g.fillTriangle(w/2 + 2, h/2 + 8, w/2 + 6, h/2 + 2, w/2 + 2, h/2 + 12);
      g.generateTexture('char-enemy', w, h);

      g.destroy();
    }
  };
})();
