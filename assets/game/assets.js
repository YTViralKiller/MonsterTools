// Helper to generate simple character textures and UI palette for the embedded game
// Uses Phaser drawing API to create textures for use in scenes
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
      // player texture
      const w = 96, h = 96;
      const g = scene.make.graphics({x:0,y:0,add:false});
      // background circle
      g.fillStyle(this.palette.primary,1);
      g.fillCircle(w/2,h/2,42);
      // face highlight
      g.fillStyle(0xffffff,0.08);
      g.fillCircle(w/2 - 8, h/2 - 8, 12);
      // armor band
      g.fillStyle(0x2b1650,1);
      g.fillRect(14, h/2 + 20, w-28, 12);
      // generate texture
      g.generateTexture('char-player', w, h);
      g.clear();

      // enemy texture (accent color)
      g.fillStyle(this.palette.accent,1);
      g.fillCircle(w/2,h/2,42);
      g.fillStyle(0xffffff,0.06);
      g.fillCircle(w/2 + 6, h/2 - 6, 10);
      g.fillStyle(0x03474b,1);
      g.fillRect(14, h/2 + 22, w-28, 10);
      g.generateTexture('char-enemy', w, h);
      g.destroy();
    }
  };
})();
