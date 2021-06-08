const player = document.getElementById('video')
const text = document.getElementById('text')
const btn = document.getElementById('btn')
const modelUrl = './weights'

window.onload = function() {
  text.textContent = "onload"
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
  faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
  faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
  faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)

  //faceapi.loadFaceLandmarkModel('./models')
  //faceapi.loadFaceRecognitionModel('./models'),
  //faceapi.loadFaceExpressionModel('./models'),
  //faceapi.loadTinyFaceDetectorModel('./models')

  //faceapi.nets.ssdMobilenetv1.load(modelUrl),
  //faceapi.nets.faceLandmark68Net.load(modelUrl),
])
.catch((e) => {
  text.textContent = ('エラー：'+e);
})
//.then(changeText)
.then(startVideo)

/*navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
  getUserMedia: function(c) {
    return new Promise(function(y, n) {
      (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c,y,n);
    });
  }
} : null);

if(!navigator.mediaDevices) {
  console.log("getUserMedia() not supported.");
  return;
}*/

function startVideo() {
  var constraints = {
    audio: true,
    video: {
      width: player.width,
      height: player.height
    }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    player.srcObject = stream;
    player.onloadedmetadata = function(e) {
      player.play();
    };
  })
  .catch(function(err) {
    console.log(err.name+": "+err.message);
  });
}

function changeText(){
  text.textContent = "OK"
}

player.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(player)
  //document.body.append(canvas)
  const displaySize = { width: player.width, height: player.height }
  //faceapi.matchDimensions(canvas, displaySize)
  /*setInterval(async () => {
    //const detections = await faceapi.detectAllFaces(player, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    //const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    //const detections = await faceapi.detectAllFaces(player, new faceapi.SsdMobilenetv1Options())
    //const resizedDetections = faceapi.resizeResults(detections, displaySize)
    //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections)
  }, 100)*/
  .catch((e) => {
    text.textContent = e;
  })
})
.catch((e) => {
  text.textContent = e;
})