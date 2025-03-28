import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.shieldActive = false;
    this.nextShotTime = 0;
    this.shotFrameToCheck = 9;
    this.wizardOriginalTint = 0xffffff;
    this.shieldOriginalTint = 0xffffff;
  }

  preload() {
    this.load.image('background', 'assets/images/cowboyBackground.png');
    this.load.spritesheet('cowboy', 'assets/images/Cowboy.png', { 
      frameWidth: 48, 
      frameHeight: 48 
    });
    this.load.image('wizardOne', 'assets/images/WizardOne.png');
    this.load.image('wizardShield', 'assets/images/WizShieldOne.png');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.cowboy = this.add.sprite(190, 160, 'cowboy'); 
    this.wizard = this.add.sprite(66, 160, 'wizardOne');
    //this.wizardOriginalTint = this.wizard.tint;

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('cowboy', { start: 0, end: 6 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'quickDraw',
      frames: this.anims.generateFrameNumbers('cowboy', { start: 14, end: 31 }),
      frameRate: 20,
      repeat: 0
    });
    
    this.cowboy.play('idle');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.shield = this.add.image(this.wizard.x + 20, this.wizard.y, 'wizardShield')
      .setVisible(false)
      .setDepth(1);
    
    this.scheduleRandomShot();
  }

  update() {
    const now = this.time.now;
    
    if (now >= this.nextShotTime && this.cowboy.anims.currentAnim?.key === 'idle') {
      this.playQuickDraw();
      this.scheduleRandomShot();
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.activateShield();
    }
  }
  
  scheduleRandomShot() {
    const delay = Phaser.Math.Between(3000, 6000);
    this.nextShotTime = this.time.now + delay;
  }
  
  activateShield() {
    if (!this.shieldActive) {
      this.shieldActive = true;
      this.shield.setVisible(true);
      
      this.time.delayedCall(1000, () => {
        this.shield.setVisible(false);
        this.shieldActive = false;
      });
    }
  }
  
  playQuickDraw() {
    if (this.cowboy.anims.currentAnim?.key !== 'quickDraw') {
      this.cowboy.play('quickDraw');
      
      this.cowboy.on('animationupdate', (animation, frame) => {
        if (frame.index === this.shotFrameToCheck) {
          this.checkShotResult();
          this.cowboy.off('animationupdate');
        }
      });
      
      this.cowboy.once('animationcomplete', () => {
        this.cowboy.play('idle');
      });
    }
  }
  
  checkShotResult() {
    if (this.shieldActive) {
      console.log("blocked!");
      this.flashShieldWhite();
    } else {
      console.log("hit!");
      this.flashWizardRed();
    }
  }
  
  flashWizardRed() {
    this.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 300,
      onUpdate: tween => {
        const value = Math.floor(tween.getValue());
        this.wizard.tint = value % 2 === 0 ? 0xff0000 : this.wizardOriginalTint;
      },
      onComplete: () => {
        this.wizard.tint = this.wizardOriginalTint;
      }
    });
  }
  
  flashShieldWhite() {
    this.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 300,
      onUpdate: tween => {
        const value = Math.floor(tween.getValue());
        this.shield.tint = value % 2 === 0 ? 0x00a2ff : this.shieldOriginalTint;
        this.shield.setScale(value % 2 === 0 ? 1.1 : 1.0);
      },
      onComplete: () => {
        this.shield.tint = this.shieldOriginalTint;
        this.shield.setScale(1.0);
      }
    });
  }
}

export default MainScene;