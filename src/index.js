import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  scene: [MainScene],
  zoom: 3
};

new Phaser.Game(config);
