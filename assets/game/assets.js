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
      // create very high-resolution textures (1280x720) so sprites render crisply when scaled
      // We'll draw the same shapes as before but scaled up to provide more detail.
      const w = 1280, h = 720;
      const baseW = 128, baseH = 128; // original design reference
      const S = Math.min(w / baseW, h / baseH);
      const ox = w / 2, oy = h / 2;
      const g = scene.make.graphics({ x: 0, y: 0, add: false });

      function X(v){ return ox + (v - baseW/2) * S; }
      function Y(v){ return oy + (v - baseH/2) * S; }
      function SW(v){ return v * S; }
      function SH(v){ return v * S; }
      function R(v){ return v * S; }

      // Player detailed sprite (scaled up)
      g.clear();
      // ambient silhouette shadow
      g.fillStyle(0x000000, 0.12);
      g.fillRoundedRect(X(10), Y(10), SW(baseW - 20), SH(baseH - 20), R(16));
      // torso base
      g.fillStyle(0x7a4bff, 1);
      g.fillRoundedRect(X(baseW/2-36), Y(baseH/2-2), SW(72), SH(84), R(12));
      // torso highlight
      g.fillStyle(0x9f7dff, 0.35);
      g.fillRoundedRect(X(baseW/2-34), Y(baseH/2+18), SW(68), SH(28), R(10));
      // chest plate
      g.fillStyle(0x4a2da8, 1);
      g.fillEllipse(X(baseW/2), Y(baseH/2+16), SW(60), SH(30));
      // helmet base
      g.fillStyle(0x5f3be0, 1);
      g.fillEllipse(X(baseW/2), Y(baseH/2-34), SW(80), SH(56));
      // helmet top highlight
      g.fillStyle(0xc3b2ff, 0.22);
      g.fillEllipse(X(baseW/2-8), Y(baseH/2-42), SW(50), SH(22));
      // visor
      g.fillStyle(0x1f1430, 1);
      g.fillRect(X(baseW/2-36), Y(baseH/2-44), SW(72), SH(18));
      // eyes
      g.fillStyle(0xffffff, 1);
      g.fillRect(X(baseW/2-18), Y(baseH/2-42), SW(12), SH(8));
      g.fillRect(X(baseW/2+6), Y(baseH/2-42), SW(12), SH(8));
      // blade and hilt
      g.fillStyle(0xffe8a6, 1);
      g.fillRoundedRect(X(baseW/2+34), Y(baseH/2-10), SW(10), SH(66), R(4));
      g.fillTriangle(X(baseW/2+28), Y(baseH/2-10), X(baseW/2+46), Y(baseH/2-10), X(baseW/2+37), Y(baseH/2-24));
      g.fillStyle(0xd3a24a, 1);
      g.fillRect(X(baseW/2+31), Y(baseH/2+8), SW(16), SH(6));
      g.generateTexture('char-player', w, h);

      // Enemy detailed sprite (scaled up)
      g.clear();
      // base body
      g.fillStyle(0x07c4d9, 1);
      g.fillRoundedRect(X(baseW/2-40), Y(baseH/2-12), SW(80), SH(94), R(14));
      // scale-like layered shading
      for(let i=0; i<6; i++){
        g.fillStyle(0x068f9a, 0.1 + i * 0.06);
        g.fillEllipse(X(baseW/2), Y(baseH/2 - 4 + i * 10), SW(72 - i * 6), SH(30));
      }
      // crest
      g.fillStyle(0x024a4f, 1);
      g.fillTriangle(X(baseW/2-36), Y(baseH/2-42), X(baseW/2), Y(baseH/2-78), X(baseW/2+36), Y(baseH/2-42));
      // jaw shadow
      g.fillStyle(0x035e66, 0.45);
      g.fillEllipse(X(baseW/2), Y(baseH/2+18), SW(64), SH(26));
      // eyes
      g.fillStyle(0xffffff, 1);
      g.fillRect(X(baseW/2-18), Y(baseH/2-18), SW(14), SH(8));
      g.fillRect(X(baseW/2+4), Y(baseH/2-18), SW(14), SH(8));
      // pupils
      g.fillStyle(0x001122, 1);
      g.fillRect(X(baseW/2-14), Y(baseH/2-16), SW(6), SH(4));
      g.fillRect(X(baseW/2+8), Y(baseH/2-16), SW(6), SH(4));
      // fangs
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(X(baseW/2-10), Y(baseH/2+8), X(baseW/2-6), Y(baseH/2-2), X(baseW/2-4), Y(baseH/2+12));
      g.fillTriangle(X(baseW/2+4), Y(baseH/2+8), X(baseW/2+8), Y(baseH/2-2), X(baseW/2+6), Y(baseH/2+12));
      g.generateTexture('char-enemy', w, h);

      g.destroy();
    }
  };
})();
