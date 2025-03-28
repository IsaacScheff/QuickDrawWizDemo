import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets here
  }

  create() {
    // Create game objects here
    this.add.text(100, 100, 'Hello Phaser!', { fill: '#0f0' });
  }

  update() {
    // Update game objects here
  }
}

export default MainScene;
