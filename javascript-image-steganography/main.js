function initCanvasses(img) {
  setCanvasDims(bc, img);
  setCanvasDims(ac, img);

  bctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, bc.width, bc.height);
  actx.drawImage(img, 0, 0, img.width, img.height, 0, 0, ac.width, ac.height);
}

// fit image to canvas max dimensions
function setCanvasDims(canvas, img) {
  var max_dim = 400;

  var new_dims = {w: 0, height: 0};
  if (img.width >= img.height) {
    new_dims.w = (img.width <= max_dim) ? img.width : max_dim;
    new_dims.h = new_dims.w * (img.height / img.width)
  } else {
    new_dims.h = (img.height <= max_dim) ? img.height : max_dim;
    new_dims.w = new_dims.h * (img.width / img.height)
  }

  canvas.width = Math.round(new_dims.w);
  canvas.height = Math.round(new_dims.h);
}

function getPixelData(ctx, location) {
  return ctx.getImageData(location.x, location.y, 1, 1).data;
}

function changePixelData(ctx, location, pixelData) {
  ctx.fillStyle = "rgba(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + "," + pixelData[3] + ")";
  ctx.fillRect(location.x, location.y, 1, 1 );
}

function encodePixel(ctx, location, data) {
  var newPixelData = getPixelData(ctx, location);

  for (var i = 0; i < 3; i++) {
    var curBinary = zeroFill(toBinary(newPixelData[i]), 8);
    var newBinary = curBinary;
    newBinary = newBinary.slice(0,6).concat(data[i*2] || 0, data[i*2 + 1] || 0);
    newPixelData[i] = toDecimal(newBinary);
  }
  changePixelData(ctx, location, newPixelData)
}

function decodePixel(ctx, location) {
  var pixelData = getPixelData(ctx, location);

  var decode = "";
  for (var i = 0; i < 3; i++) {
    var binary = zeroFill(toBinary(pixelData[i]), 8);
    decode = decode + binary.slice(6);
  }
  return decode;
}

function updateAfterCanvas(c) {
  var ctx = c.getContext('2d');
  var msg = document.getElementById('message-input').value;
  encodeLength(ctx, msg.length);
  encodeMessage(c, msg);

  console.log(decodeMessage(c));
}

function encodeLength(ctx, newLength) {
  var binaryLengthStr = zeroFill(toBinary(newLength), 32);
  var tempStr = binaryLengthStr;

  var i = 0;
  while (tempStr.length > 0) {
    var slice = tempStr.slice(0, 6);
    var tempStr = tempStr.slice(6);
    encodePixel(ctx, getCanvasLocation(ac, i), slice);
    i++;
  }
}

function decodeLength(c) {
  var ctx = c.getContext('2d');

  var lengthBin = "";
  var i = 0;
  while (lengthBin.length < 32) {
    lengthBin = lengthBin + decodePixel(ctx, getCanvasLocation(c, i));
    i++;
  }
  return toDecimal(lengthBin.slice(0,32));
}

function toBinary(decNum) {
  return parseInt(decNum,10).toString(2);
}

function encodeMessage(c, msg) {
  var ctx = c.getContext('2d');

  var binMsg = "";
  for (var i = 0; i < msg.length; i++) {
    binMsg = binMsg.concat(zeroFill(toBinary(msg.charCodeAt(i)), 8));
  }

  var j = 0;
  while (binMsg.length > 0) {
    var slice = binMsg.slice(0, 6);
    binMsg = binMsg.slice(6);
    encodePixel(ctx, getCanvasLocation(c, 6 + j), slice);
    j++;
  }
}

function decodeMessage(c) {
  var ctx = c.getContext('2d');

  var msg = "";
  var msgLength = decodeLength(c);
  var parseLength = Math.ceil(msgLength * 4/3); 

  var binMsg = "";
  var i = 0;
  while (i < parseLength) {
    binMsg = binMsg + decodePixel(ctx, getCanvasLocation(c, 6 + i));
    i++;
  }

  for (var j = 0; j < msgLength; j++) {
    var slice = binMsg.slice(0, 8);
    binMsg = binMsg.slice(8);
    msg = msg.concat(String.fromCharCode(toDecimal(slice)));
  }

  return msg;
}

function zeroFill(number, width)
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function toDecimal(binary) {
  return parseInt(binary,2).toString(10);
}

function getCanvasLocation(c, n) {
  var location = {x: n % c.width, y: Math.floor(n / c.width)};
  if (location.y > c.height) {
    return -1;
  }
  
  return location;
}

// grab image and canvas
var img = document.getElementById('main-img');

// before canvas
var bc = document.getElementById('before-img');
var bctx = bc.getContext('2d');

// after canvas
var ac = document.getElementById('after-img');
var actx = ac.getContext('2d');

// check if image is drawn, so that it can drawn to canvas
if (img.complete) {
  initCanvasses(img);
} else {
  img.addEventListener('load', function () {
    initCanvasses(this);
  });
}

// setup textarea listener
$("#message-input").on('change keyup paste', function() {
  updateAfterCanvas(ac);
});