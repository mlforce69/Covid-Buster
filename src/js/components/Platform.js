/*
 * Copyright (c) 2022 EGT Digital - All rights reserved.
 *
 * File: platform.js
 *
 * Written by Martin Lubenov <martin.lubenov@egt-digital.com> on  16.06.22 12:14 pm.
 * Last modified: 16.06.22 12:14 pm.
 *
 * More information at: https://egt-digital.com/
 */
export default class Platform {
  constructor({ x, y, image, block, text }) {
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

    this.block = block;
    this.text = text;
  }

  draw(context) {
    context.drawImage(this.image, this.position.x, this.position.y);
    if (this.text) {
      context.font = '20px Arial'
      context.fillStyle = "red";
      context.fillText(this.text, this.position.x, this.position.y);
    }
  }
  update(context) {
    this.draw(context);
    this.position.x += this.velocity.x;
  }
}
