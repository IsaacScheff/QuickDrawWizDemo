import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.shieldActive = false;
    this.nextShotTime = 0;
    this.shotFrameToCheck = 9;
    this.wizardOriginalTint = 0xffffff;
    this.shieldOriginalTint = 0xffffff;

    this.isWizardAttacking = false;
    this.attackChargeTimer = null;

    this.wizAttackTime = 1000;
    this.cowboyMinReset = 2000;
    this.cowboyMaxReset = 4000;

    this.shieldCooldown = false;
    this.shieldCooldownDuration = 1000;
    this.shieldCooldownTimer = null;
    this.lastShieldTime = 0;
    this.shieldSpellFrameRate = 8 / (this.shieldCooldownDuration / 1000);
    this.shieldTime = 500;
  }

  preload() {
    this.load.image('background', 'assets/images/cowboyBackground.png');
    this.load.spritesheet('cowboy', 'assets/images/Cowboy.png', { 
      frameWidth: 48, 
      frameHeight: 48 
    });
    this.load.image('wizardOne', 'assets/images/WizardOne.png');
    this.load.image('wizardShield', 'assets/images/WizShieldOne.png');
    this.load.image('wizardOneAttack', 'assets/images/WizardOneAttack.png');
    this.load.spritesheet('shieldSpellIcon', 'assets/images/ShieldSpellIcon.png', {
      frameWidth: 21,
      frameHeight: 21,
    });
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0.2);
    this.cowboy = this.add.sprite(190, 130, 'cowboy'); 
    this.wizard = this.add.sprite(66, 130, 'wizardOne');

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

    this.anims.create({
      key: 'shieldIconCooldown',
      frames: this.anims.generateFrameNumbers('shieldSpellIcon', { start: 0, end: 7 }),
      frameRate: this.shieldSpellFrameRate,
      repeat: 0
    });
    
    this.cowboy.play('idle');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);  
    
    this.shield = this.add.image(this.wizard.x + 20, this.wizard.y, 'wizardShield')
      .setVisible(false)
      .setDepth(1);

    this.shieldCooldownIndicator = this.add.sprite(30, 200, 'shieldSpellIcon');
    this.shieldCooldownIndicator.setFrame(7);
    this.updateShieldCooldownVisual();
    
    this.scheduleRandomShot();
  }

  update() {
    const now = this.time.now;
    
    if (now >= this.nextShotTime && this.cowboy.anims.currentAnim?.key === 'idle') {
      this.playQuickDraw();
      this.scheduleRandomShot();
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isWizardAttacking) {
      this.activateShield();
    }

    if (Phaser.Input.Keyboard.JustDown(this.fKey) && !this.isWizardAttacking) {
      this.startWizardAttack();
    }

    this.updateShieldCooldownVisual();
  }
  
  scheduleRandomShot() {
    const delay = Phaser.Math.Between(this.cowboyMinReset, this.cowboyMaxReset);
    this.nextShotTime = this.time.now + delay;
  }
  
  activateShield() {
    if (!this.shieldActive && !this.shieldCooldown) {
        this.shieldCooldownIndicator.setFrame(0);
        this.shieldActive = true;
        this.shield.setVisible(true);
        this.lastShieldTime = this.time.now;
        
        this.time.delayedCall(this.shieldTime, () => {
            this.shield.setVisible(false);
            this.shieldActive = false;

            this.shieldCooldown = true;
            this.shieldCooldownTimer = this.time.delayedCall(this.shieldCooldownDuration, () => {
                this.shieldCooldown = false;
                this.shieldCooldownTimer = null;
            });
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
      this.interruptWizardAttack();
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

  startWizardAttack() {
    this.isWizardAttacking = true;
    
    this.wizard.setTexture('wizardOneAttack');
    
    this.attackChargeTimer = this.time.delayedCall(this.wizAttackTime, () => {
      this.completeWizardAttack();
    });
  }
  
  interruptWizardAttack() {
    if (this.isWizardAttacking) {

      if (this.attackChargeTimer) {
        this.attackChargeTimer.destroy();
        this.attackChargeTimer = null;
      }

      this.wizard.setTexture('wizardOne');
      this.isWizardAttacking = false;
    }
  }
  
  completeWizardAttack() {    
    this.flashCowboyRed();
    
    this.wizard.setTexture('wizardOne');
    this.isWizardAttacking = false;
  }
  
  flashCowboyRed() {
    this.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 300,
      onUpdate: tween => {
        const value = Math.floor(tween.getValue());
        this.cowboy.tint = value % 2 === 0 ? 0xff0000 : 0xffffff;
      },
      onComplete: () => {
        this.cowboy.tint = 0xffffff;
      }
    });
  }

  updateShieldCooldownVisual() {
    if (this.shieldCooldown) {
        if (!this.shieldCooldownIndicator.anims.isPlaying) {
            this.shieldCooldownIndicator.play('shieldIconCooldown');
        }
    } else {
        this.shieldCooldownIndicator.anims.stop();
    }
  }
}

export default MainScene;