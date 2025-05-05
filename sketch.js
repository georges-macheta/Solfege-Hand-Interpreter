
const startCameraBtn = document.getElementById('start-camera');
const helpBtn = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeModalBtn = document.querySelector('.close-modal');
const keySelect = document.getElementById('key-select');
const canvasContainer = document.getElementById('canvas-container');
const cameraPrompt = document.getElementById('camera-prompt');
const currentSignEl = document.getElementById('current-sign');
const currentNoteEl = document.getElementById('current-note');
const modelStatusDot = document.getElementById('model-status');
const modelStatusText = document.getElementById('model-text');
const handStatusDot = document.getElementById('hand-status');
const handStatusText = document.getElementById('hand-text');


let selectedKey = 'C';
let videoStarted = false;
let modelLoaded = false;
let handDetected = false;


let p5Instance;
let video;
let handpose;
let predictions = [];
let oscillator;
let currentSign = '';
let isPlaying = false;

const noteFrequencies = {
  'C': {
    'Do': 261.63, 'Re': 293.66, 'Mi': 329.63, 
    'Fa': 349.23, 'Sol': 392.00, 'La': 440.00, 'Ti': 493.88, 'HighDo': 523.25
  },
  'D': {
    'Do': 293.66, 'Re': 329.63, 'Mi': 369.99, 
    'Fa': 392.00, 'Sol': 440.00, 'La': 493.88, 'Ti': 554.37, 'HighDo': 587.33
  },
  'E': {
    'Do': 329.63, 'Re': 369.99, 'Mi': 415.30, 
    'Fa': 440.00, 'Sol': 493.88, 'La': 554.37, 'Ti': 622.25, 'HighDo': 659.25
  },
  'F': {
    'Do': 349.23, 'Re': 392.00, 'Mi': 440.00, 
    'Fa': 466.16, 'Sol': 523.25, 'La': 587.33, 'Ti': 659.25, 'HighDo': 698.46
  },
  'G': {
    'Do': 392.00, 'Re': 440.00, 'Mi': 493.88, 
    'Fa': 523.25, 'Sol': 587.33, 'La': 659.25, 'Ti': 739.99, 'HighDo': 783.99
  },
  'A': {
    'Do': 440.00, 'Re': 493.88, 'Mi': 554.37, 
    'Fa': 587.33, 'Sol': 659.25, 'La': 739.99, 'Ti': 830.61, 'HighDo': 880.00
  },
  'B': {
    'Do': 493.88, 'Re': 554.37, 'Mi': 622.25, 
    'Fa': 659.25, 'Sol': 739.99, 'La': 830.61, 'Ti': 932.33, 'HighDo': 987.77
  }
};


const keyToNoteMap = {
  'C': { 'Do': 'C', 'Re': 'D', 'Mi': 'E', 'Fa': 'F', 'Sol': 'G', 'La': 'A', 'Ti': 'B' },
  'D': { 'Do': 'D', 'Re': 'E', 'Mi': 'F#', 'Fa': 'G', 'Sol': 'A', 'La': 'B', 'Ti': 'C#' },
  'E': { 'Do': 'E', 'Re': 'F#', 'Mi': 'G#', 'Fa': 'A', 'Sol': 'B', 'La': 'C#', 'Ti': 'D#' },
  'F': { 'Do': 'F', 'Re': 'G', 'Mi': 'A', 'Fa': 'Bb', 'Sol': 'C', 'La': 'D', 'Ti': 'E' },
  'G': { 'Do': 'G', 'Re': 'A', 'Mi': 'B', 'Fa': 'C', 'Sol': 'D', 'La': 'E', 'Ti': 'F#' },
  'A': { 'Do': 'A', 'Re': 'B', 'Mi': 'C#', 'Fa': 'D', 'Sol': 'E', 'La': 'F#', 'Ti': 'G#' },
  'B': { 'Do': 'B', 'Re': 'C#', 'Mi': 'D#', 'Fa': 'E', 'Sol': 'F#', 'La': 'G#', 'Ti': 'A#' }
};


startCameraBtn.addEventListener('click', toggleVideo);
helpBtn.addEventListener('click', openHelpModal);
closeModalBtn.addEventListener('click', closeHelpModal);
keySelect.addEventListener('change', (e) => {
  selectedKey = e.target.value;
  if (videoStarted && currentSign !== '' && currentSign !== '-') {
    playNote(currentSign);
    updateSignDisplay(currentSign);
  }
});


window.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    closeHelpModal();
  }
});


const sketch = (p) => {
  p.setup = function() {
    
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    const canvas = p.createCanvas(width, height);
    canvas.parent(canvasContainer);
    
    
    oscillator = new p5.Oscillator('sine');
    
    
    p.background(18, 18, 18);
  };

  p.draw = function() {
    
    if (video) {
      
      p.background(18, 18, 18);
      
      
      p.push();
      p.translate(p.width, 0);
      p.scale(-1, 1);
      p.image(video, 0, 0, p.width, p.height);
      p.pop();
      
     
      if (predictions.length > 0) {
        updateHandStatus(true);
        drawHand();
        classifySolfege();
      } else {
        updateHandStatus(false);
        if (isPlaying) {
          oscillator.amp(0, 0.1);
          isPlaying = false;
          currentSign = '';
          updateSignDisplay('-');
        }
      }
    }
  };

  function drawHand() {
    
    const hand = predictions[0];
    const landmarks = hand.landmarks;
    
    
    p.stroke(77, 182, 172);
    p.strokeWeight(2);
    
    
    for (let i = 0; i < 5; i++) {
      p.line(
        landmarks[0][0], landmarks[0][1],
        landmarks[i*4+1][0], landmarks[i*4+1][1]
      );
    }
    
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const curr = landmarks[i*4+j+1];
        const next = landmarks[i*4+j+2];
        p.line(curr[0], curr[1], next[0], next[1]);
      }
    }
    
    
    p.noStroke();
    p.fill(77, 182, 172);
    for (let i = 0; i < landmarks.length; i++) {
      const [x, y] = landmarks[i];
      p.ellipse(x, y, 10, 10);
    }
  }

  function classifySolfege() {
    const hand = predictions[0];
    const landmarks = hand.landmarks;
    
    
    const fingerTips = [
      landmarks[4],   // thumb
      landmarks[8],   // index
      landmarks[12],  // middle
      landmarks[16],  // ring
      landmarks[20]   // pinky
    ];
    
    const fingerBases = [
      landmarks[2],   // thumb base
      landmarks[5],   // index base
      landmarks[9],   // middle base
      landmarks[13],  // ring base
      landmarks[17]   // pinky base
    ];
    
    // Determine if each finger is extended
    const extended = fingerTips.map((tip, i) => {
      // Get y-distance (vertical) between tip and base
      const yDist = fingerBases[i][1] - tip[1];
      // For thumb, check x-distance from wrist
      if (i === 0) {
        const xDist = Math.abs(tip[0] - landmarks[0][0]);
        return xDist > 40;
      }
      // For other fingers, check if tip is higher than base
      return yDist > 40;
    });
    
    // Classify hand sign based on extended fingers
    let sign = '';
    
    if (extended[1] && !extended[2] && !extended[3] && !extended[4]) {
      sign = 'Do'; // Index only
    } else if (extended[1] && extended[2] && !extended[3] && !extended[4]) {
      sign = 'Re'; // Index + Middle
    } else if (extended[1] && extended[2] && extended[3] && !extended[4]) {
      sign = 'Mi'; // Index + Middle + Ring
    } else if (!extended[0] && extended[1] && extended[2] && extended[3] && extended[4]) {
      sign = 'Fa'; // All except thumb
    } else if (extended[0] && extended[1] && extended[2] && extended[3] && extended[4]) {
      sign = 'Sol'; // All five
    } else if (!extended[0] && !extended[1] && !extended[2] && extended[3] && extended[4]) {
      sign = 'La'; // All except middle
    } else if (!extended[0] && !extended[1] && extended[2] && extended[3] && extended[4]) {
      sign = 'Ti'; // Middle + Ring + Pinky
    } else if (extended[0] && !extended[1] && !extended[2] && !extended[3] && extended[4]) {
      sign = 'HighDo'; 
    }
    
    
    if (sign !== currentSign) {
      if (sign === '') {
        
        if (isPlaying) {
          oscillator.amp(0, 0.1);
          isPlaying = false;
          updateSignDisplay('-');
        }
      } else {
        
        playNote(sign);
        updateSignDisplay(sign);
      }
      currentSign = sign;
    }
  }
};


p5Instance = new p5(sketch);


function toggleVideo() {
  if (!videoStarted) {
    startVideo();
    startCameraBtn.textContent = 'Stop Camera';
    startCameraBtn.style.backgroundColor = '#f44336';
    cameraPrompt.style.display = 'none';
  } else {
    stopVideo();
    startCameraBtn.textContent = 'Start Camera';
    startCameraBtn.style.backgroundColor = '';
    cameraPrompt.style.display = 'flex';
  }
  
  videoStarted = !videoStarted;
}


function startVideo() {
  // Create video capture
  video = p5Instance.createCapture(p5Instance.VIDEO);
  video.size(canvasContainer.clientWidth, canvasContainer.clientHeight);
  video.hide();
  
  // Initialize handpose model
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    predictions = results;
  });
}

// Function to stop video
function stopVideo() {
  if (video) {
    video.remove();
    video = null;
  }
  
  if (handpose) {
    handpose.dispose();
  }
  
  if (isPlaying) {
    oscillator.stop();
    isPlaying = false;
  }
  
  predictions = [];
  currentSign = '';
  updateSignDisplay('-');
  
  // Clear the canvas
  p5Instance.clear();
  p5Instance.background(18, 18, 18);
}

// Function to play a note based on solfege sign
function playNote(sign) {
  const freq = noteFrequencies[selectedKey][sign];
  
  if (!isPlaying) {
    oscillator.start();
    isPlaying = true;
  }
  
  oscillator.freq(freq);
  oscillator.amp(0.5, 0.1);
}

// Function to update the sign display
function updateSignDisplay(sign) {
  currentSignEl.textContent = sign;
  
  if (sign === '-') {
    currentNoteEl.textContent = 'No note detected';
  } else {
    currentNoteEl.textContent = `Playing ${keyToNoteMap[selectedKey][sign]} (${sign})`;
  }
}

// Function called when model is loaded
function modelReady() {
  console.log('Handpose model loaded');
  updateModelStatus(true);
}

// Function to update model status display
function updateModelStatus(loaded) {
  modelLoaded = loaded;
  if (loaded) {
    modelStatusDot.className = 'status-dot active';
    modelStatusText.textContent = 'Model loaded successfully';
  } else {
    modelStatusDot.className = 'status-dot loading';
    modelStatusText.textContent = 'Loading model...';
  }
}

// Function to update hand detection status display
function updateHandStatus(detected) {
  handDetected = detected;
  if (detected) {
    handStatusDot.className = 'status-dot active';
    handStatusText.textContent = 'Hand detected';
  } else {
    handStatusDot.className = 'status-dot inactive';
    handStatusText.textContent = 'No hand detected';
  }
}

// Functions to handle the help modal
function openHelpModal() {
  helpModal.style.display = 'block';
}

function closeHelpModal() {
  helpModal.style.display = 'none';
}

// Window resize handler
window.addEventListener('resize', () => {
  if (p5Instance) {
    p5Instance.resizeCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
    if (video) {
      video.size(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }
  }
});