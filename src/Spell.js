export default class Spell {
    constructor(scene, spellData) {
      this.scene = scene;
      this.name = spellData.name;
      this.cooldownDuration = spellData.cooldownDuration || 1000;
      this.castTime = spellData.castTime || 0;
      this.iconTexture = spellData.iconTexture;
      this.indicatorX = spellData.indicatorX;
      this.indicatorY = spellData.indicatorY;
      this.onCast = spellData.onCast;
      this.onComplete = spellData.onComplete;
      this.onInterrupt = spellData.onInterrupt;
      
      this.isActive = false;
      this.isOnCooldown = false;
      
      this.cooldownIndicator = this.scene.add.sprite(
        this.indicatorX,
        this.indicatorY,
        this.iconTexture,
        7  // Explicitly set to frame 7, can be changed later if icon animations vary
      ).setInteractive();
      
      this.cooldownIndicator.on('pointerdown', () => {
        if (!this.isActive && !this.isOnCooldown) {
          this.cast();
        }
      });
    }
  
    cast() {
      if (this.isActive || this.isOnCooldown) return;
      
      this.isActive = true;
      this.cooldownIndicator.setFrame(0);
      
      if (this.onCast) this.onCast();
      
      if (this.castTime > 0) {
        this.scene.time.delayedCall(this.castTime, () => {
          this.complete();
        });
      } else {
        this.complete();
      }
    }
  
    complete() {
      this.isActive = false;
      if (this.onComplete) this.onComplete();
      this.startCooldown();
    }
  
    startCooldown() {
      this.isOnCooldown = true;
      
      // Play cooldown animation (frames 0-7)
      this.cooldownIndicator.play({
        key: `${this.name}Cooldown`,
        frameRate: 8 / (this.cooldownDuration / 1000),
        repeat: 0
      });
      
      this.scene.time.delayedCall(this.cooldownDuration, () => {
        this.isOnCooldown = false;
        this.cooldownIndicator.setFrame(7); // Reset to ready frame
      });
    }
  
    interrupt() {
      if (!this.isActive) return;
      
      this.isActive = false;
      if (this.onInterrupt) this.onInterrupt();
      this.startCooldown();
    }
  }