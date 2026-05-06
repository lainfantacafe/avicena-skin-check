const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoImg = document.getElementById('photoImg');
const ctx = canvas.getContext('2d');
const cameraBtn = document.getElementById('cameraBtn');
const uploadBtn = document.getElementById('uploadBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('results');
const recsList = document.getElementById('recs');

let faceMesh;
let cameraStream;

async function initFaceMesh() {
  faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.onResults(onResults);
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
}

cameraBtn.onclick = async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = cameraStream;
    video.style.display = 'block';
    canvas.style.display = 'block';
    await initFaceMesh();
    predictLive();
  } catch (err) {
    alert('Cámara requiere HTTPS. Usa upload.');
  }
};

uploadBtn.onclick = () => document.getElementById('photoInput').click();

document.getElementById('photoInput').onchange = e => {
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  photoImg.src = url;
  photoImg.style.display = 'block';
  analyzeBtn.style.display = 'block';
};

analyzeBtn.onclick = () => stubAnalysis();

function predictLive() {
  if (video.videoWidth > 0) {
    faceMesh.send({ image: video });
  }
  requestAnimationFrame(predictLive);
}

function onResults(results) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: '#007BFF', lineWidth: 1 });
    }
  }
  ctx.restore();
}

function stubAnalysis() {
  const concerns = [
    { name: 'Arrugas', level: 'media', rec: 'Botox, bioestimuladores' },
    { name: 'Acné', level: 'baja', rec: 'Limpieza facial, láser' },
    { name: 'Manchas', level: 'alta', rec: 'Láser CO2' }
  ];
  concerns.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: ${c.level} → ${c.rec}`;
    recsList.appendChild(li);
  });
  resultsSection.style.display = 'block';
}

initFaceMesh();
