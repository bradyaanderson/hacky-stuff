class canvasSteg {

  constructor(c) {
    this.c = c;
    this.ctx = c.getContext('2d');

    this.LENGTHSIZE = 32;
    this.CHARSIZE = 8;
    this.MAXPIXELDATA = 6;
    this.MSGSTART = Math.ceil(this.LENGTHSIZE / this.MAXPIXELDATA);
  }

  getCanvasLocation(n) {
  var location = {x: n % this.c.width, y: Math.floor(n / this.c.width)};
  if (location.y > this.c.height) {
    return -1;
  }
  
  return location;
}

  getPixelRGBA(location) {
    return this.ctx.getImageData(location.x, location.y, 1, 1).data;
  }

  setPixelRGBA(location, pixelData) {
    this.ctx.fillStyle = "rgba(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + "," + pixelData[3] + ")";
    this.ctx.fillRect(location.x, location.y, 1, 1);
  }

  encodePixel(location, data) {
    var newPixelData = this.getPixelRGBA(location);

    for (var i = 0; i < 3; i++) {
      var curBinary = this.zeroFill(this.toBinary(newPixelData[i]), 8);
      var newBinary = curBinary;
      newBinary = newBinary.slice(0, this.MAXPIXELDATA).concat(data[i * 2] || 0, data[i * 2 + 1] || 0);
      newPixelData[i] = this.toDecimal(newBinary);
    }
    this.setPixelRGBA(location, newPixelData);
  }

  decodePixel(location) {
    var pixelData = this.getPixelRGBA(location);

    var decode = "";
    for (var i = 0; i < 3; i++) {
      var binary = this.zeroFill(this.toBinary(pixelData[i]), 8);
      decode = decode + binary.slice(this.MAXPIXELDATA);
    }
    return decode;
  }

  encodeLength(length) {
    var binaryLengthStr = this.zeroFill(this.toBinary(length), this.LENGTHSIZE);
    var tempStr = binaryLengthStr;

    var i = 0;
    while (tempStr.length > 0) {
      var slice = tempStr.slice(0, this.MAXPIXELDATA);
      tempStr = tempStr.slice(this.MAXPIXELDATA);
      this.encodePixel(this.getCanvasLocation(i), slice);
      i++;
    }
  }

  decodeLength() {
    var lengthBin = "";
    var i = 0;
    while (lengthBin.length < this.LENGTHSIZE) {
      lengthBin = lengthBin + this.decodePixel(this.getCanvasLocation(i));
      i++;
    }
    return this.toDecimal(lengthBin.slice(0, this.LENGTHSIZE));
  }

  encodeMessage(msg) {
    this.encodeLength(msg.length);

    var binMsg = "";
    for (var i = 0; i < msg.length; i++) {
      binMsg = binMsg.concat(this.zeroFill(this.toBinary(msg.charCodeAt(i)), this.CHARSIZE));
    }

    var j = 0;
    while (binMsg.length > 0) {
      var slice = binMsg.slice(0, this.MAXPIXELDATA);
      binMsg = binMsg.slice(this.MAXPIXELDATA);
      this.encodePixel(this.getCanvasLocation(j + this.MSGSTART), slice);
      j++;
    }
  }

  decodeMessage() {
    var msg = "";
    var msgLength = this.decodeLength();
    var parseLength = Math.ceil(msgLength * (this.CHARSIZE / this.MAXPIXELDATA));

    var binMsg = "";
    var i = 0;
    while (i < parseLength) {
      binMsg = binMsg + this.decodePixel(this.getCanvasLocation(i + this.MSGSTART));
      i++;
    }

    for (var j = 0; j < msgLength; j++) {
      var slice = binMsg.slice(0, this.CHARSIZE);
      binMsg = binMsg.slice(this.CHARSIZE);
      msg = msg.concat(String.fromCharCode(this.toDecimal(slice)));
    }

    return msg;
  }

  zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
  }

  toDecimal(binary) {
    return parseInt(binary, 2).toString(10);
  }

  toBinary(decNum) {
    return parseInt(decNum, 10).toString(2);
  }
}

function initCanvas(c, img) {
  setCanvasDims(c, img);

  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, c.width, c.height);
}

function setCanvasDims(canvas, img) {
  var max_dim = 400;

  var new_dims = {w: 0, height: 0};
  if (img.width >= img.height) {
    new_dims.w = (img.width <= max_dim) ? img.width : max_dim;
    new_dims.h = new_dims.w * (img.height / img.width);
  } else {
    new_dims.h = (img.height <= max_dim) ? img.height : max_dim;
    new_dims.w = new_dims.h * (img.width / img.height);
  }

  canvas.width = Math.round(new_dims.w);
  canvas.height = Math.round(new_dims.h);
}

// grab image and canvas
var img = document.getElementById('main-img');

// before canvas
var bc = document.getElementById('before-img');

// after canvas
var ac = document.getElementById('after-img');

var cs = new canvasSteg(ac);

// check if image is drawn, so that it can drawn to canvas
if (img.complete) {
  initCanvas(bc, img);
  initCanvas(ac, img);

} else {
  img.addEventListener('load', function () {
    initCanvas(bc, this);
    initCanvas(ac, this);
  });
}

// setup textarea listener
$("#message-input").on('change keyup paste', function() {
  var input = document.getElementById('message-input').value;
  cs.encodeMessage(input);
  console.log(cs.decodeMessage());
});