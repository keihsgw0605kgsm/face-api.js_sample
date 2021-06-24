const player = document.getElementById('video')
const download = document.getElementById('download')
//const p_text = document.getElementById('test')
var detections_json = "No Data"
const modelUrl = './weights'
var test_csv = []

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
    //p_text.textContent = detections[0]['detection']['_box']['_x']

    test_csv = [
      ['_x', '_y', '_width', '_height', 'x0', 'y0', 'x1', 'y1'],
      [detections[0]['detection']['_box']['_x'], detections[0]['detection']['_box']['_y'], detections[0]['detection']['_box']['_width'], detections[0]['detection']['_box']['_height'], detections[0]['landmarks']['_positions'][0]['_x'], detections[0]['landmarks']['_positions'][0]['_y'], detections[0]['landmarks']['_positions'][1]['_x'], detections[0]['landmarks']['_positions'][1]['_y']]
    ]


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
/*function handleDownload() {
  var blob = new Blob([ detections_json ], { "type" : "text/plain" });
  var url = window.URL.createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test_face.json"); 
}*/

function handleDownload() {
  let data = test_csv.map((arr)=>arr.json(',')).json('\r\n');
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF])

  var blob = new Blob([ bom, data ], { "type" : "text/csv" });
  //var url = window.URL.createObjectURL(blob);
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  download.href = url;
  //window.navigator.msSaveBlob(blob, "test_face.csv");
}