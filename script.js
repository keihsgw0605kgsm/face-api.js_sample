const player = document.getElementById('video')
const download = document.getElementById('download')
const p_text = document.getElementById('test')
var detections_json = "No Data"
const modelUrl = './weights'

/**モデルのロード**/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
  //faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
  faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
  //faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
  //faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
])
.catch((e) => {
  console.log('モデルをロードできません: '+e);
})
.then(startVideo)

/**カメラを用いたビデオストリーミング**/
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

/**カメラオン時のイベント**/
player.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(player)
  document.body.append(canvas)
  const displaySize = { width: player.width, height: player.height }
  faceapi.matchDimensions(canvas, displaySize)
  
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(player, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    
    //const detections = await faceapi.detectAllFaces(player, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    detections_json = JSON.stringify(detections, null, '\t');
    //var detections_json1 = JSON.parse(detections)
    p_text.textContent = detections[0]['detection']['_box']['_x']

    //結果の出力
    console.log(detections);
  }, 100)
  .catch((e) => {
    console.log('setIntervalでエラー：'+e);
  })
})
.catch((e) => {
  console.log('player.addEventListenerでエラー：'+e);
})

/** jsonファイルのダウンロード **/
function handleDownload() {
  var blob = new Blob([ detections_json ], { "type" : "text/plain" });
  var url = window.URL.createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test_face.json"); 
}