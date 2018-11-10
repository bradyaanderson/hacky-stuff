function initCanvasses(img) {
  setCanvasDims(bc, img);
  setCanvasDims(ac, img);

  bctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, bc.width, bc.height);
  actx.drawImage(img, 0, 0, img.width, img.height, 0, 0, ac.width, ac.height);

}

// fit image to canvas max dimensions
function setCanvasDims(canvas, img) {
  var max_dim = 400;

  var new_dims = {width: 0, height: 0};
  if (img.width >= img.height) {
    new_dims.width = (img.width <= max_dim) ? img.width : max_dim;
    new_dims.height = new_dims.width * (img.height / img.width)
  } else {
    new_dims.height = (img.height <= max_dim) ? img.height : max_dim;
    new_dims.width = new_dims.height * (img.width / img.height)
  }

  canvas.width = Math.round(new_dims.width);
  canvas.height = Math.round(new_dims.height);
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
  initCanvasses()
} else {
  img.addEventListener('load', function () {
    initCanvasses(this);
  });
}