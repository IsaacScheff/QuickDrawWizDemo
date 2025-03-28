import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('background', 'assets/images/cowboyBackground.png');
    this.load.spritesheet('cowboy', 'assets/images/Cowboy.png', { 
      frameWidth: 48, 
      frameHeight: 48 
    });
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.cowboy = this.add.sprite(190, 160, 'cowboy'); 
    
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('cowboy', {
        start: 0,
        end: 6
      }),
      frameRate: 10,
      repeat: -1
    });
    
    this.cowboy.play('idle');
  }

  update() {
  }
}

export default MainScene;
