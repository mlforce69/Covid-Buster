import {
  createImage,
  createImageAsync,
  isOnTopOfPlatform,
  collisionTop,
  objectsTouch,
  isOnTopOfPlatformCircle,
  hitBottomOfPlatform,
  hitSideOfPlatform,
} from "./utils";

import { createDescriptionModal, createQuestionModal } from "./popUp";

// base game imports
import platform from "../img/level1/platform.png";
import hills from "../img/level1/hills.png";
import background from "../img/level1/background.png";
import platformSmallTall from "../img/level1/platformSmallTall.png";
import Platform from "./components/Platform";
import block from "../img/level1/block.png";
import blockTri from "../img/level1/blockTri.png";
import mdPlatform from "../img/level1/mdPlatform.png";
import lgPlatform from "../img/level1/lgPlatform.png";
import tPlatform from "../img/level1/tPlatform.png";
import xtPlatform from "../img/level1/xtPlatform.png";
import flagPole from "../img/level1/flagPole.png";

// character imports
import spriteRunLeft from "../img/level1/spriteRunLeft.png";
import spriteRunRight from "../img/level1/spriteRunRight.png";
import spriteStandLeft from "../img/level1/spriteStandLeft.png";
import spriteStandRight from "../img/level1/spriteStandRight.png";

// virus import
import virus from "../img/level1/virus.png";

// powerup - mask import
import mask from "../img/level1/mask.png";

// sound imports
import { audio } from "./audio.js";

// level2 imports
import { images } from "./images.js";

// ===============================END OF IMPORTS================================== //

// get the canvas and its context and set its size
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

class Player {
  constructor() {
    this.speed = 6;
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 65;
    this.height = 150;

    this.image = createImage(spriteStandRight);
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 65,
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.5,
      },
    };
    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 177;
    this.powerUps = {
      mask: false,
    };
  }

  draw() {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (
      this.frames > 59 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    ) {
      this.frames = 0;
    } else if (
      this.frames > 29 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    ) {
      this.frames = 0;
    }

    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y,
    };
    this.velocity = {
      x: 0,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Virus {
  constructor({
    position,
    velocity,
    distance = {
      limit: 50,
      travelled: 0,
    },
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.image = createImage(virus);

    this.width = 50;
    this.height = 50;

    this.distance = distance;
  }

  // draw() {
  //   c.fillStyle = 'red'
  //   c.fillRect(this.position.x, this.position.y, this.width, this.height)
  // }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }

    // make the virus walk back and forth
    this.distance.travelled += Math.abs(this.velocity.x);

    if (this.distance.travelled > this.distance.limit) {
      this.distance.travelled = 0;
      this.velocity.x = -this.velocity.x;
    }
  }
}

class Mask {
  constructor({ position, velocity }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.image = createImage(mask);

    this.width = 60;
    this.height = 50;
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Particle {
  constructor({
    position,
    velocity,
    radius,
    color = "#f00ad1",
    fireBall = false,
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.radius = radius;
    this.ttl = 300;
    this.color = color;
    this.fireBall = fireBall;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = "#f00ad1";
    c.fill();
    c.closePath();
  }

  update() {
    this.ttl--;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.radius + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity * 0.4;
    }
  }
}

// initialize the all variables
let paused = false;
let platformImage;
let platformSmallTallImage;
let blockImage;
let blockTriImage;
let mdPlatformImage;
let lgPlatformImage;
let tPlatformImage;
let xtPlatformImage;
let flagPoleImage;

let player = new Player();
let platforms = [];

let genericObjects = [];
let viruses = [];
let particles = [];
let masks = [];

let lastKey;
let keys;

let scrollOffset;
let currentLevel = 1;
let questionToShow;

function selectLevel(currentLevel) {
  switch (currentLevel) {
    case 1:
      init();
      break;
    case 2:
      initLevel2();
      break;
  }
}

// ======================================= INIT ======================================= //

async function init() {
  audio.musicLevel1.play();


  player = new Player();
  keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };
  scrollOffset = 0;

  platformImage = await createImageAsync(platform);
  platformSmallTallImage = await createImageAsync(platformSmallTall);
  blockImage = await createImageAsync(block);
  blockTriImage = await createImageAsync(blockTri);
  mdPlatformImage = await createImageAsync(mdPlatform);
  lgPlatformImage = await createImageAsync(lgPlatform);
  tPlatformImage = await createImageAsync(tPlatform);
  xtPlatformImage = await createImageAsync(xtPlatform);
  flagPoleImage = await createImageAsync(flagPole);

  // add player
  player = new Player();

  // add viruses

  const virusWidth = 50;

  viruses = [
    new Virus({
      position: { x: 908 + lgPlatformImage.width - virusWidth, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 350,
        travelled: 0,
      },
    }),
    new Virus({
      position: { x: 3249 + lgPlatformImage.width - virusWidth, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 350,
        travelled: 0,
      },
    }),
    new Virus({
      position: { x: 3249 + lgPlatformImage.width - virusWidth * 2, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 350,
        travelled: 0,
      },
    }),
    new Virus({
      position: { x: 3249 + lgPlatformImage.width - virusWidth * 3, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 350,
        travelled: 0,
      },
    }),
    new Virus({
      position: { x: 3249 + lgPlatformImage.width - virusWidth * 4, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 350,
        travelled: 0,
      },
    }),
    new Virus({
      position: { x: 5135 + xtPlatformImage.width / 2 + virusWidth, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: {
        limit: 100,
        travelled: 0,
      },
    }),
  ];

  masks = [
    new Mask({
      position: {
        x: 2300,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    }),
  ];

  // add particles
  particles = [];

  // add the map platform images
  platforms = [
    new Platform({
      x: 908 + 100,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 908 + 300,
      y: 100,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width,
      y: canvas.height - lgPlatformImage.height - tPlatformImage.height,
      image: tPlatformImage,
      block: true,
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width - 100,
      y: canvas.height - lgPlatformImage.height - tPlatformImage.height / 2,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 5712 + xtPlatformImage.width + 175,
      y: canvas.height - lgPlatformImage.height - tPlatformImage.height / 2,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 5712 + xtPlatformImage.width + 175 * 2 + blockTriImage.width,
      y: canvas.height - lgPlatformImage.height,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 5712 + xtPlatformImage.width + 175 * 3 + blockTriImage.width * 2,
      y: canvas.height - lgPlatformImage.height * 2,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 6250 + xtPlatformImage.width + 175 * 3 + blockTriImage.width * 2,
      y: canvas.height - lgPlatformImage.height,
      image: lgPlatformImage,
      block: true,
    }),
    new Platform({
      x: 7720,
      y: canvas.height - lgPlatformImage.height - flagPoleImage.height,
      image: flagPoleImage,
    }),
  ];

  // add the map images
  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background),
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills),
    }),
  ];

  scrollOffset = 0;

  // create the level formation
  const platformsMap = [
    "lg", 
    "lg",
    "gap",
    "lg",
    "gap",
    "gap",
    "lg",
    "gap",
    "t",
    "gap",
    "xt",
    "gap",
    "xt",
    "gap",
    "gap",
    "xt",
  ];

  // used to measuze the initial draw of every platform
  let platformDistance = 0;
  let gapSize = 175;

  platformsMap.forEach((symbol) => {
    switch (symbol) {
      case "lg":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - lgPlatformImage.height,
            image: lgPlatformImage,
            block: true,
            text: platformDistance,
          })
        );
        platformDistance += lgPlatformImage.width - 2;

        break;
      case "xt":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - xtPlatformImage.height,
            image: xtPlatformImage,
            block: true,
            text: platformDistance,
          })
        );
        platformDistance += xtPlatformImage.width - 2;
        break;
      case "t":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - tPlatformImage.height,
            image: tPlatformImage,
            block: true,
          })
        );
        platformDistance += tPlatformImage.width - 2;

        break;
      case "gap":
        platformDistance += gapSize;
        break;
    }
  });
}
// =================================== INIT END ===================================== //

// ===============================INIT LEVEL 2 START ============================= //

async function initLevel2() {
  player = new Player();
  keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };
  scrollOffset = 0;

  blockImage = await createImageAsync(block);
  blockTriImage = await createImageAsync(blockTri);
  mdPlatformImage = await createImageAsync(images.levels[2].mdPlatform);
  lgPlatformImage = await createImageAsync(images.levels[2].lgPlatform);
  tPlatformImage = await createImageAsync(tPlatform);
  xtPlatformImage = await createImageAsync(xtPlatform);
  flagPoleImage = await createImageAsync(flagPole);
  const mountains = await createImageAsync(images.levels[2].mountains);

  // add player
  player = new Player();

  // add viruses

  const virusWidth = 50;

  viruses = [
    new Virus({
      position: {
        x: 903 + mdPlatformImage.width - virusWidth,
        y: 100,
      },
      velocity: {
        x: -2,
        y: 0,
      },
      distance: {
        limit: 400,
        traveled: 0,
      },
    }),
    new Virus({
      position: {
        x:
          1878 +
          lgPlatformImage.width +
          155 +
          200 +
          200 +
          200 +
          blockImage.width / 2 -
          virusWidth / 2,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      distance: {
        limit: 0,
        traveled: 0,
      },
    }),
    new Virus({
      position: {
        x: 3831 + lgPlatformImage.width - virusWidth,
        y: 100,
      },
      velocity: {
        x: -1,
        y: 0,
      },
      distance: {
        limit: lgPlatformImage.width - virusWidth,
        traveled: 0,
      },
    }),

    new Virus({
      position: {
        x: 4734,
        y: 100,
      },
      velocity: {
        x: 1,
        y: 0,
      },
      distance: {
        limit: lgPlatformImage.width - virusWidth,
        traveled: 0,
      },
    }),
  ];

  masks = [
    new Mask({
      position: {
        x: 4734 - 28,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    }),
  ];

  // add particles
  particles = [];

  // add the map platform images
  platforms = [
    new Platform({
      x: 903 + mdPlatformImage.width + 115,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 903 + mdPlatformImage.width + 115 + blockTriImage.width,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 175,
      y: 360,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200,
      y: 300,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200,
      y: 330,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200 + 200,
      y: 240,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 4734 - mdPlatformImage.width / 2,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 3,
      image: mdPlatformImage,
    }),
  ];

  // add the map images
  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(images.levels[2].background),
    }),
    new GenericObject({
      x: -1,
      y: canvas.height - mountains.height,
      image: mountains,
    }),
  ];

  scrollOffset = 0;

  // create the level formation
  const platformsMap = [
    "lg",
    "md",
    "gap",
    "gap",
    "gap",
    "lg",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "lg",
    "lg",
    "gap",
    "gap",
    "md",
    "gap",
    "gap",
    "md",
    "gap",
    "gap",
    "lg",
  ];

  // used to measuze the initial draw of every platform
  let platformDistance = 0;
  let gapSize = 175;

  platformsMap.forEach((symbol) => {
    switch (symbol) {
      case "lg":
        platforms.push(
          new Platform({
            x: platformDistance - 2,
            y: canvas.height - lgPlatformImage.height,
            image: lgPlatformImage,
            block: true,
            text: platformDistance,
          })
        );

        platformDistance += lgPlatformImage.width - 2;

        break;
      case "md":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - mdPlatformImage.height,
            image: mdPlatformImage,
            block: true,
            text: platformDistance,
          })
        );

        platformDistance += xtPlatformImage.width - 2;

        break;
      case "xt":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - xtPlatformImage.height,
            image: xtPlatformImage,
            block: true,
            text: platformDistance,
          })
        );

        platformDistance += xtPlatformImage.width - 2;

        break;
      case "t":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - tPlatformImage.height,
            image: tPlatformImage,
            block: true,
          })
        );

        platformDistance += tPlatformImage.width - 2;

        break;
      case "gap":
        platformDistance += gapSize;
        break;
    }
  });
}

// ===============================INIT LEVEL 2 END ============================= //

// =================================== ANIMATE ===================================== //
function animate() {
  requestAnimationFrame(animate);

  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => {
    genericObject.update();
    genericObject.velocity.x = 0;
  });

  // draw platform
  platforms.forEach((platform) => {
    platform.update(c);
    platform.velocity.x = 0;
  });

  // draw masks
  masks.forEach((mask, index) => {
    if (objectsTouch(player, mask)) {
      player.powerUps.mask = true;
      audio.obtainMask.play();
      paused = true;
      audio.musicLevel1.stop();
      questionToShow = index + 1
      console.log(questionToShow)
      setTimeout(() => {
        masks.splice(index, 1);
      }, 0);
      createDescriptionModal(index + 1, false);
      setTimeout(() => {
        paused = false;
        audio.musicLevel1.play();
        createDescriptionModal(index + 1, true);
      }, 20000);
    } else {
      player.powerUps.mask = false;
      mask.update();
    }
  });

  console.log(paused);

  if (paused === false) {
    // draw virus
    viruses.forEach((virus, index) => {
      virus.update();

      // remove virus on fireball hit
      particles
        .filter((particle) => particle.fireBall)
        .forEach((particle, particleIndex) => {
          if (
            particle.position.x + particle.radius >= virus.position.x &&
            particle.position.y + particle.radius >= virus.position.y &&
            particle.position.x - particle.radius <=
              virus.position.x + virus.width &&
            particle.position.y - particle.radius <=
              virus.position.y + virus.height
          ) {
            for (let i = 0; i < 50; i++) {
              particles.push(
                new Particle({
                  position: {
                    x: virus.position.x + virus.width / 2,
                    y: virus.position.y + virus.height / 2,
                  },
                  velocity: {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 15,
                  },
                  radius: Math.random() * 3,
                })
              );
            }
            setTimeout(() => {
              viruses.splice(index, 1);
              particles.splice(particleIndex, 1);
            }, 0);
          }
        });

      // stepping on top of the virus
      if (collisionTop(player, virus)) {
        audio.virusSquash.play();

        for (let i = 0; i < 50; i++) {
          particles.push(
            new Particle({
              position: {
                x: virus.position.x + virus.width / 2,
                y: virus.position.y + virus.height / 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 15,
              },
              radius: Math.random() * 3,
            })
          );
        }

        player.velocity.y -= 40;
        setTimeout(() => {
          viruses.splice(index, 1);
        }, 0);
      } else if (objectsTouch(player, virus)) {
        audio.die.play();
        selectLevel(currentLevel);
      }
    });

    particles.forEach((particle, index) => {
      particle.update();

      if (
        particle.fireBall &&
        (particle.position.x - particle.radius >= canvas.width ||
          particle.position.x + particle.radius <= 0)
      ) {
        setTimeout(() => {
          particles.splice(index, 1);
        }, 0);
      }
    });

    player.update();

    // player movement
    let hitSide = false;
    if (keys.right.pressed && player.position.x < 400) {
      player.velocity.x = player.speed;
    } else if (
      (keys.left.pressed && player.position.x > 100) ||
      (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
    ) {
      player.velocity.x = -player.speed;
    } else {
      player.velocity.x = 0;

      // scrolling to the left
      if (keys.right.pressed) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          platform.velocity.x = -player.speed;
          // if we are on the left side of the platform
          if (
            platform.block &&
            hitSideOfPlatform({
              object: player,
              platform: platform,
            })
          ) {
            platforms.forEach((platform) => {
              platform.velocity.x = 0;
            });

            hitSide = true;
            break;
          }
        }

        if (!hitSide) {
          scrollOffset += player.speed;

          genericObjects.forEach((genericObject) => {
            genericObject.velocity.x = -player.speed * 0.66;
          });
          viruses.forEach((virus) => {
            virus.position.x -= player.speed;
          });
          masks.forEach((mask) => {
            mask.position.x -= player.speed;
          });
          particles.forEach((particle) => {
            particle.position.x -= player.speed;
          });
        }
      }
      // scrolling to the right
      else if (keys.left.pressed && scrollOffset > 0) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          platform.velocity.x = player.speed;

          // if we are on the right side of the platform
          if (
            platform.block &&
            hitSideOfPlatform({
              object: player,
              platform: platform,
            })
          ) {
            platforms.forEach((platform) => {
              platform.velocity.x = 0;
            });

            hitSide = true;
            break;
          }
        }

        if (!hitSide) {
          scrollOffset -= player.speed;

          genericObjects.forEach((genericObject) => {
            genericObject.velocity.x = player.speed * 0.66;
          });
          viruses.forEach((virus) => {
            virus.position.x += player.speed;
          });
          masks.forEach((mask) => {
            mask.position.x += player.speed;
          });
          particles.forEach((particle) => {
            particle.position.x += player.speed;
          });
        }
      }

      // win condition
      if (scrollOffset + 400 + player.width >= 7720) {
        let levelToContinue;
        console.log("you win");
        paused = true;

        if (!player.powerUps.mask) {
          paused = false;
          selectLevel(1);
        }

        setTimeout(() => {
          levelToContinue = createQuestionModal(1, false);
          console.log(levelToContinue);

        }, 500)

        setTimeout(() => {
          paused = false;
          selectLevel(2);
          
        }, 15000);

        audio.musicLevel1.stop();

      }

      //losе condition
      if (player.position.y > canvas.height) {
        audio.die.play();
        selectLevel(currentLevel);
      }
    }

    // collision detection with platform
    platforms.forEach((platform) => {
      if (isOnTopOfPlatform(player, platform)) {
        player.velocity.y = 0;
      }

      if (
        platform.block &&
        hitBottomOfPlatform({
          object: player,
          platform: platform,
        })
      ) {
        player.velocity.y = -player.velocity.y;
      }

      if (
        platform.block &&
        hitSideOfPlatform({
          object: player,
          platform: platform,
        })
      ) {
        player.velocity.x = 0;
      }

      // particles bounce
      particles.forEach((particle, index) => {
        if (isOnTopOfPlatformCircle(particle, platform)) {
          const bounce = 0.9;
          particle.velocity.y = -particle.velocity.y * bounce;
          if (particle.radius - 0.4 < 0) {
            particles.splice(index, 1);
          } else {
            particle.radius -= 0.4;
          }
        }
        // remove particles after 300 frames
        if (particle.ttl < 0) {
          particles.splice(index, 1);
        }
      });

      viruses.forEach((virus) => {
        if (isOnTopOfPlatform(virus, platform)) {
          virus.velocity.y = 0;
        }
      });

      masks.forEach((mask) => {
        if (isOnTopOfPlatform(mask, platform)) {
          mask.velocity.y = 0;
        }
      });
    });

    //sprite switching
    if (
      keys.right.pressed &&
      lastKey === "right" &&
      player.currentSprite !== player.sprites.run.right
    ) {
      player.frames = 1;
      player.currentSprite = player.sprites.run.right;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
    } else if (
      keys.left.pressed &&
      lastKey === "left" &&
      player.currentSprite !== player.sprites.run.left
    ) {
      player.frames = 1;
      player.currentSprite = player.sprites.run.left;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.width = player.sprites.run.width;
    } else if (
      !keys.left.pressed &&
      lastKey === "left" &&
      player.currentSprite !== player.sprites.stand.left
    ) {
      player.frames = 1;
      player.currentSprite = player.sprites.stand.left;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      player.width = player.sprites.stand.width;
    } else if (
      !keys.right.pressed &&
      lastKey === "right" &&
      player.currentSprite !== player.sprites.stand.right
    ) {
      player.frames = 1;
      player.currentSprite = player.sprites.stand.right;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      player.width = player.sprites.stand.width;
    }
  }
}

// =================================== ANIMATE END ===================================== //

selectLevel(currentLevel);
// initLevel2();
animate();

addEventListener("keydown", ({ keyCode }) => {
  // if (disableKeys) return;

  switch (keyCode) {
    case 65:
    case 37: {
      console.log("left");
      keys.left.pressed = true;
      lastKey = "left";
      break;
    }
    case 83:
    case 40: {
      console.log("down");
      break;
    }
    case 68:
    case 39: {
      console.log("right");
      keys.right.pressed = true;
      lastKey = "right";
      break;
    }
    case 87:
    case 38: {
      console.log("up");
      player.velocity.y -= 25;
      audio.jump.play();
      break;
    }
    case 32:
      console.log("space");

      if (!player.powerUps.mask) {
        return;
      }

      audio.maskShot.play();

      let velocity = 15;
      if (lastKey === "left") {
        velocity = -velocity;
      }

      particles.push(
        new Particle({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
          },
          velocity: {
            x: velocity,
            y: 0,
          },
          radius: 5,
          fireBall: true,
        })
      );
      break;
  }
});

addEventListener("keyup", ({ keyCode }) => {

  switch (keyCode) {
    case 65:
    case 37: {
      console.log("left");
      keys.left.pressed = false;
      break;
    }
    case 83:
    case 40: {
      console.log("down");
      break;
    }
    case 68:
    case 39: {
      console.log("right");
      keys.right.pressed = false;
      break;
    }
    case 87:
    case 38: {
      console.log("up");
      break;
    }
  }
});
