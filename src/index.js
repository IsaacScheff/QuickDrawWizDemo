import Phaser from 'phaser';
import ShowdownScene from './scenes/ShowdownScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  scene: [ShowdownScene],
  zoom: 3
};

new Phaser.Game(config);
