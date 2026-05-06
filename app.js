const video = document.getElementById('video');
const canvas = document.getElementById('outputCanvas');
const photoCanvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const cameraBtn = document.getElementById('cameraBtn');
const uploadBtn = document.getElementById('uploadBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const results = document.getElementById('results');
const issuesList = document.getElementById('issues');
const recsList = document.getElementById('recs');

let faceMesh;
let camera;

async function initMediaPipe() {
  const faceMeshConfig = {
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  };
  faceMesh = new FaceMesh({locateFile: faceMeshConfig.locateFile});
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults(onResults);
}

cameraBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();
  video.style.display = 'block';
  camera = stream;
  initMediaPipe();
};

uploadBtn.onclick = () => {
  document.getElementById('photoInput').click();
};

document.getElementById('photoInput').onchange = (e) => {
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  photoCanvas.src = url;
  photoCanvas.style.display = 'block';
  analyzeBtn.style.display = 'block';
};

analyzeBtn.onclick = () => {
  stubAnalysis();
};

function onResults(results) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {color: '#8B5CF6', lineWidth: 1});
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF6B6B'});
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF6B6B'});
    }
  }
  ctx.restore();
  canvas.style.display = 'block';
  analyzeBtn.style.display = 'block';
  requestAnimationFrame(predictWebcam);
}

async function predictWebcam() {
  if (camera) {
    await faceMesh.send({image: video});
  }
}

function stubAnalysis() {
  // Stub TF.js model
  const issues = ['Arrugas: media', 'Acné: baja', 'Pigmentación: alta'];
  const recs = [
    'Botox y bioestimuladores para arrugas',
    'Limpieza facial y láser para acné',
    'Láser CO2 para pigmentación'
  ];
  issuesList.innerHTML = issues.map(i => `<li>${i}</li>`).join('');
  recsList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  results.style.display = 'block';
}

initMediaPipe();