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
      // create higher-resolution 128x128 textures with layered shading/details
      const w = 128, h = 128;
      const g = scene.make.graphics({x:0,y:0,add:false});

      // Player detailed sprite
      g.clear();
      // ambient silhouette shadow
      g.fillStyle(0x000000,0.12);
      g.fillRoundedRect(10, 10, w - 20, h - 20, 16);
      // torso base
      g.fillStyle(0x7a4bff,1);
      g.fillRoundedRect(w/2-36, h/2-2, 72, 84, 12);
      // torso highlight
      g.fillStyle(0x9f7dff,0.35);
      g.fillRoundedRect(w/2-34, h/2+18, 68, 28, 10);
      // chest plate
      g.fillStyle(0x4a2da8,1);
      g.fillEllipse(w/2, h/2+16, 60, 30);
      // helmet base
      g.fillStyle(0x5f3be0,1);
      g.fillEllipse(w/2, h/2-34, 80, 56);
      // helmet top highlight
      g.fillStyle(0xc3b2ff,0.22);
      g.fillEllipse(w/2-8, h/2-42, 50, 22);
      // visor
      g.fillStyle(0x1f1430,1);
      g.fillRect(w/2-36, h/2-44, 72, 18);
      // eyes
      g.fillStyle(0xffffff,1);
      g.fillRect(w/2-18, h/2-42, 12, 8);
      g.fillRect(w/2+6, h/2-42, 12, 8);
      // blade and hilt
      g.fillStyle(0xffe8a6,1);
      g.fillRoundedRect(w/2+34, h/2-10, 10, 66, 4);
      g.fillTriangle(w/2+28, h/2-10, w/2+46, h/2-10, w/2+37, h/2-24);
      g.fillStyle(0xd3a24a,1);
      g.fillRect(w/2+31, h/2+8, 16, 6);
      g.generateTexture('char-player', w, h);

      // Enemy detailed sprite
      g.clear();
      // base body
      g.fillStyle(0x07c4d9,1);
      g.fillRoundedRect(w/2-40, h/2-12, 80, 94, 14);
      // scale-like layered shading
      for(let i=0; i<6; i++){
        g.fillStyle(0x068f9a, 0.1 + i * 0.06);
        g.fillEllipse(w/2, h/2 - 4 + i * 10, 72 - i * 6, 30);
      }
      // crest
      g.fillStyle(0x024a4f,1);
      g.fillTriangle(w/2-36, h/2-42, w/2, h/2-78, w/2+36, h/2-42);
      // jaw shadow
      g.fillStyle(0x035e66,0.45);
      g.fillEllipse(w/2, h/2+18, 64, 26);
      // eyes
      g.fillStyle(0xffffff,1);
      g.fillRect(w/2-18, h/2-18, 14, 8);
      g.fillRect(w/2+4, h/2-18, 14, 8);
      // pupils
      g.fillStyle(0x001122,1);
      g.fillRect(w/2-14, h/2-16, 6, 4);
      g.fillRect(w/2+8, h/2-16, 6, 4);
      // fangs
      g.fillStyle(0xffffff,1);
      g.fillTriangle(w/2-10, h/2+8, w/2-6, h/2-2, w/2-4, h/2+12);
      g.fillTriangle(w/2+4, h/2+8, w/2+8, h/2-2, w/2+6, h/2+12);
      g.generateTexture('char-enemy', w, h);

      g.destroy();
    }
  };
})();
