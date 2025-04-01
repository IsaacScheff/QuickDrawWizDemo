import Phaser from 'phaser';

class ShowdownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShowdownScene' });
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

    this.attackCooldown = false;
    this.attackCooldownDuration = 500;
    this.attackCooldownTimer = null;
    this.lastAttackTime = 0;
    this.fireballSpellFrameRate = 8 / (this.attackCooldownDuration / 1000);
    this.attackDamage = 25;
    
    this.backgroundColor = 0xadd8e6

    this.cowboyMaxHealth = 100;
    this.cowboyShotDamage = 80; 
    
    this.wizardMaxHealth = 100;
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
    this.load.spritesheet('fireballSpellIcon', 'assets/images/FireballSpellIcon.png', {
      frameWidth: 21,
      frameHeight: 21,
    });
  }

  create() {
    this.cowboyHealth = this.cowboyMaxHealth;
    this.wizardHealth = this.wizardMaxHealth;

    this.add.image(0, 0, 'background').setOrigin(0, 0.2);
    this.cowboy = this.add.sprite(190, 130, 'cowboy'); 
    this.wizard = this.add.sprite(66, 130, 'wizardOne');

    this.cameras.main.setBackgroundColor(this.backgroundColor);

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

    this.anims.create({
      key: 'fireballIconCooldown',
      frames: this.anims.generateFrameNumbers('fireballSpellIcon', { start: 0, end: 7 }),
      frameRate: this.shieldSpellFrameRate,
      repeat: 0
    });
    
    this.cowboy.play('idle');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);  
    
    this.shield = this.add.image(this.wizard.x + 20, this.wizard.y, 'wizardShield')
      .setVisible(false)
      .setDepth(1);

    this.shieldCooldownIndicator = this.add.sprite(100, 200, 'shieldSpellIcon').setInteractive();;
    this.shieldCooldownIndicator.setFrame(7);
    this.updateShieldCooldownVisual();

    this.fireballCooldownIndicator = this.add.sprite(140, 200, 'fireballSpellIcon').setInteractive();;
    this.fireballCooldownIndicator.setFrame(7);
    
    this.scheduleRandomShot();

    this.cowboyHealthBarBg = this.add.graphics()
    .fillStyle(0xff0000, 1)
    .fillRect(190 - 25, 130 - 30, 50, 5);

    this.cowboyHealthBar = this.add.graphics()
        .fillStyle(0x00ff00, 1)
        .fillRect(190 - 25, 130 - 30, 50, 5);

    this.wizardHealthBarBg = this.add.graphics()
    .fillStyle(0xff0000, 1)
    .fillRect(66 - 25, 130 - 30, 50, 5);

    this.wizardHealthBar = this.add.graphics()
    .fillStyle(0x00ff00, 1)
    .fillRect(66 - 25, 130 - 30, 50, 5);

    this.createConfirmationBox();
  }

  update() {
    const now = this.time.now;

    this.fireballCooldownIndicator.on('pointerdown', () => {
      if (!this.isWizardAttacking && !this.attackCooldown) {
        this.startWizardAttack();
      }
    });

    this.shieldCooldownIndicator.on('pointerdown', () => {
      if (!this.isWizardAttacking) {
        this.activateShield();
      }
    });
    
    if (now >= this.nextShotTime && this.cowboy.anims.currentAnim?.key === 'idle') {
      this.playQuickDraw();
      this.scheduleRandomShot();
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isWizardAttacking) {
      this.activateShield();
    }

    if (Phaser.Input.Keyboard.JustDown(this.fKey) && !this.isWizardAttacking && !this.attackCooldown) {
      this.startWizardAttack();
    }

    this.updateShieldCooldownVisual();
    this.updateAttackCooldownVisual();
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
    if (this.cowboyHealth <= 0) return;
    
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
      this.damageWizard(this.cowboyShotDamage);
      this.flashWizardRed();
      this.interruptWizardAttack();
    }
  }
  
  flashWizardRed() {
    if (this.wizardHealth <= 0) return;

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
    if (!this.isWizardAttacking && !this.attackCooldown) {
      this.isWizardAttacking = true;
      this.fireballCooldownIndicator.setFrame(0);
        
      this.wizard.setTexture('wizardOneAttack');
        
      this.attackChargeTimer = this.time.delayedCall(this.wizAttackTime, () => {
        this.completeWizardAttack();
            
        this.attackCooldown = true;
        this.lastAttackTime = this.time.now;
        this.attackCooldownTimer = this.time.delayedCall(this.attackCooldownDuration, () => {
          this.attackCooldown = false;
            this.attackCooldownTimer = null;
        });
      });
    }
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
    this.damageCowboy(this.attackDamage);
    this.flashCowboyRed();
    
    this.wizard.setTexture('wizardOne');
    this.isWizardAttacking = false;
  }

  damageCowboy(amount) {
    this.cowboyHealth = Phaser.Math.Clamp(this.cowboyHealth - amount, 0, this.cowboyMaxHealth);
    this.updateCowboyHealthBar();
    
    if (this.cowboyHealth <= 0) {
      this.cowboy.tint = 0x000000;
        this.cowboyDefeated();
    }
  }
  
  updateCowboyHealthBar() {
    const healthPercent = this.cowboyHealth / this.cowboyMaxHealth;
    
    this.cowboyHealthBar.clear()
        .fillStyle(0x00ff00, 1)
        .fillRect(190 - 25, 130 - 30, 50 * healthPercent, 5);
    
    if (healthPercent < 0.3) {
        this.cowboyHealthBar.fillStyle(0xff0000, 1);
    } else if (healthPercent < 0.6) {
        this.cowboyHealthBar.fillStyle(0xffff00, 1);
    }
  }

  flashCowboyRed() {
    if (this.cowboyHealth <= 0) return;

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

  updateAttackCooldownVisual() {
    if (this.attackCooldown) {
        if (!this.fireballCooldownIndicator.anims.isPlaying) {
            this.fireballCooldownIndicator.play('fireballIconCooldown');
        }
    } else if(this.isWizardAttacking) {
      this.fireballCooldownIndicator.setFrame(0);
    } else {
      this.fireballCooldownIndicator.anims.stop();
      this.fireballCooldownIndicator.setFrame(7);
    }
  }

  cowboyDefeated() {
    // Play defeat animation or handle game over
    console.log("Cowboy defeated!");
    this.cowboy.anims.stop();
    this.cowboy.tint = 0x000000;

    this.nextShotTime = Infinity;

    this.time.delayedCall(1000, () => {
      this.showConfirmationBox();
    });
  }

  updateWizardHealthBar() {
    const healthPercent = this.wizardHealth / this.wizardMaxHealth;
    const width = 50 * healthPercent;

    this.wizardHealthBar.clear();
    
    if (healthPercent < 0.3) {
        this.wizardHealthBar.fillStyle(0xffa500, 1); //orange
    } else if (healthPercent < 0.6) {
        this.wizardHealthBar.fillStyle(0xffff00, 1); //yellow
    } else {
        this.wizardHealthBar.fillStyle(0x00ff00, 1); //green
    }
    
    this.wizardHealthBar.fillRect(66 - 25, 130 - 30, width, 5);
  }

  damageWizard(amount) {
    this.wizardHealth = Phaser.Math.Clamp(this.wizardHealth - amount, 0, this.wizardMaxHealth);
    this.updateWizardHealthBar();
    
    if (this.wizardHealth <= 0) {
        this.wizardDefeated();
    }
  }

  wizardDefeated() {
    console.log("Wizard defeated!");
    this.wizard.setTint(0x000000);
    this.wizard.anims.stop();
    
    this.isWizardAttacking = false;
    this.shieldActive = false;
    this.shield.setVisible(false);
    
    if (this.attackChargeTimer) {
        this.attackChargeTimer.destroy();
        this.attackChargeTimer = null;
    }
    if (this.shieldCooldownTimer) {
        this.shieldCooldownTimer.destroy();
        this.shieldCooldownTimer = null;
    }

    this.time.delayedCall(1000, () => {
      this.showConfirmationBox();
    });
  }

  createConfirmationBox() {
    this.confirmationBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      300,
      150,
      0x000000,
      0.7
    ).setOrigin(0.5).setDepth(10).setVisible(false);
  
    this.confirmationText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 30,
      'Return to Main Menu?',
      { 
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false);
  
    this.yesButton = this.add.text(
      this.cameras.main.centerX - 60,
      this.cameras.main.centerY + 30,
      'Yes',
      { 
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#008000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false)
     .setInteractive()
     .on('pointerdown', () => {
      this.scene.stop('ShowdownScene');
       this.scene.start('MainMenuScene');
     });
  
    this.noButton = this.add.text(
      this.cameras.main.centerX + 60,
      this.cameras.main.centerY + 30,
      'No',
      { 
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#800000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false)
     .setInteractive()
     .on('pointerdown', () => {
       this.hideConfirmationBox();
     });
  }
  
  showConfirmationBox() {
    this.confirmationBg.setVisible(true);
    this.confirmationText.setVisible(true);
    this.yesButton.setVisible(true);
    this.noButton.setVisible(true);
  }
  
  hideConfirmationBox() {
    this.confirmationBg.setVisible(false);
    this.confirmationText.setVisible(false);
    this.yesButton.setVisible(false);
    this.noButton.setVisible(false);
  }

  resetGame() {
    this.shieldActive = false;
    this.nextShotTime = 0;
    this.isWizardAttacking = false;
    this.attackCooldown = false;
    this.shieldCooldown = false;
    
    this.cowboyHealth = this.cowboyMaxHealth;
    this.wizardHealth = this.wizardMaxHealth;
    
    this.cowboy.setTint(0xffffff);
    this.wizard.setTint(0xffffff);
    this.wizard.setTexture('wizardOne');
    this.shield.setVisible(false);
    
    this.cowboy.play('idle');

    this.updateCowboyHealthBar();
    this.updateWizardHealthBar();

    this.shieldCooldownIndicator.setFrame(7);
    this.fireballCooldownIndicator.setFrame(7);

    if (this.attackChargeTimer) {
        this.attackChargeTimer.destroy();
        this.attackChargeTimer = null;
    }
    if (this.shieldCooldownTimer) {
        this.shieldCooldownTimer.destroy();
        this.shieldCooldownTimer = null;
    }
    if (this.attackCooldownTimer) {
        this.attackCooldownTimer.destroy();
        this.attackCooldownTimer = null;
    }
    
    this.scheduleRandomShot();
    
    this.hideConfirmationBox();
  }
}

export default ShowdownScene;