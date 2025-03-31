import Phaser from 'phaser';
import MainMenuScene from './scenes/MainMenuScene.js';
import ShowdownScene from './scenes/ShowdownScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  scene: [MainMenuScene, ShowdownScene],
  zoom: 3
};

new Phaser.Game(config);
