export default {
    default: {
        texture: 'cowboy',
        maxHealth: 100,
        shotDamage: 80,
        idleAnim: { start: 0, end: 6, frameRate: 10 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
        minReset: 2000,
        maxReset: 4000,
        isDual: false
    },
    cowboy: {
        texture: 'cowboy',
        maxHealth: 100,
        shotDamage: 80,
        idleAnim: { start: 0, end: 6, frameRate: 10 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
        minReset: 2000,
        maxReset: 4000,
        isDual: false
    },
    cowboyRedbeard: {
        texture: 'cowboyRedbeard',
        maxHealth: 120,
        shotDamage: 70,
        idleAnim: { start: 0, end: 6, frameRate: 8 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 18 },
        minReset: 2500,
        maxReset: 4500,
        isDual: false
    },
    cowboyWhitesuit: {
        texture: 'cowboyWhitesuit',
        maxHealth: 80,
        shotDamage: 100,
        idleAnim: { start: 0, end: 6, frameRate: 12 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 24 },
        minReset: 1500,
        maxReset: 3500,
        isDual: false
    },
    cowboyDuo: {
        texture: 'cowboy', 
        maxHealth: 150,
        shotDamage: 30, 
        idleAnim: { start: 0, end: 6, frameRate: 10 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
        minReset: 1800,
        maxReset: 3200,
        isDual: true 
      }
};