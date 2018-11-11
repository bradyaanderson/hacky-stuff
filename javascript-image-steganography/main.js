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

function getPixelData(ctx, x, y) {
  return ctx.getImageData(x, y, 1, 1).data;
}

function changePixelData(ctx, x, y) {

}

function updateAfter() {
  var message = document.getElementById('message-input').value;
  updateLength(message.length);
}

function updateLength(newLength) {
  var binaryLengthStr = zeroFill(toBinary(newLength), 32);
  console.log(binaryLengthStr);
}

function readLength() {

}

function toBinary(decNum) {
  return parseInt(decNum,10).toString(2);
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
  var location = {x: c.width % c.width, y: Math.floor(n / c.width)};
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
  initCanvasses(img)
} else {
  img.addEventListener('load', function () {
    initCanvasses(this);
  });
}

// setup textarea listener
$("#message-input").on('change keyup paste', function() {
  updateAfter();
});