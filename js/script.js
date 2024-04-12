function ln () {
    window.alert("Link not available");
    
};

// Get references to HTML elements
const startButton = document.getElementById('startButton');
const outputDiv = document.getElementById('output');

// Check if the browser supports the Web Speech API
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();

  // Set recognition options
  recognition.continuous = true;
  recognition.lang = 'en-US';

  // Event handler for when speech is recognized
  recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    outputDiv.textContent = transcript;
  };

  // Event handler for errors
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  };

  // Event handler for when recording starts
  recognition.onstart = function() {
    startButton.textContent = 'Recording...';
  };

  // Event handler for when recording stops
  recognition.onend = function() {
    startButton.textContent = 'Start Recording';
  };

  // Event listener for when the start button is clicked
  startButton.addEventListener('click', function() {
    if (recognition.running) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
} else {
  // If the Web Speech API is not supported
  outputDiv.textContent = 'Web Speech API is not supported in this browser.';
}

/*… 
const audioFileInput = document.getElementById('audioFileInput');
const transcriptionOutput = document.getElementById('transcriptionOutput');

audioFileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(event) {
      const audioData = event.target.result;
      transcribeAudio(audioData);
    };

    reader.readAsArrayBuffer(file);
  }
}


function transcribeAudio(audioData) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = audioContext.createBufferSource();

  audioContext.decodeAudioData(audioData, function(buffer) {
    audioBuffer.buffer = buffer;

    const recognition = new webkitSpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onresult = function(event) {
      const transcript = event.results[event.results.length - 1][0].transcript;
      transcriptionOutput.textContent = transcript;
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
    audioBuffer.start();
  });
}     */



const audioFileInput = document.getElementById('audioFileInput');
const waveformDiv = document.getElementById('waveform');
const transcriptionOutput = document.getElementById('transcriptionOutput');
let wavesurfer;

audioFileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];

  if (file && file.type === 'audio/wav') {
    const reader = new FileReader();

    reader.onload = function(event) {
      const audioData = event.target.result;
      visualizeWaveform(audioData);
      transcribeAudio(audioData);
    };

    reader.readAsArrayBuffer(file);
  } else {
    alert('Please select a .wav audio file.');
  }
}

function visualizeWaveform(audioData) {
  if (wavesurfer) {
    wavesurfer.destroy();
  }
  
  wavesurfer = WaveSurfer.create({
    container: waveformDiv,
    waveColor: 'black',
    progressColor: 'red'
  });
  
  wavesurfer.loadBlob(new Blob([audioData]));
}
/*
function transcribeAudio(audioData) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = audioContext.createBufferSource();

  audioContext.decodeAudioData(audioData, function(buffer) {
    audioBuffer.buffer = buffer;

    // Your code to transcribe Bengali text using a speech-to-text API
    // Here, you would send the audio data to the API and handle the transcription response
    // For example, using Google Cloud Speech-to-Text API or another speech recognition service
    // Due to the limitations of this environment, I can't provide code for the API integration.
    // You would need to refer to the documentation of the specific API you're using.
    // Once you get the transcription response, you can update the transcriptionOutput element.
    // For demonstration purposes, let's assume you have the transcription text.

    const transcriptionText = "আপনার অডিও ফাইল এর টেক্সট";

    transcriptionOutput.textContent = transcriptionText;
  }); */
  // Function to transcribe Bengali text using Google Cloud Speech-to-Text API
function transcribeAudio(audioData) {
    // Convert audio data to base64
    const base64Audio = arrayBufferToBase64(audioData);
  
    // Construct the request
    const request = {
      audio: {
        content: base64Audio,
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000, // Adjust according to your audio file
        languageCode: 'bn-BD', // Bengali (Bangladesh)
      },
    };
  
    // Make a request to the Google Cloud Speech-to-Text API
    fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0 && data.results[0].alternatives) {
        const transcript = data.results[0].alternatives[0].transcript;
        transcriptionOutput.textContent = transcript;
      } else {
        transcriptionOutput.textContent = 'Transcription not available.';
      }
    })
    .catch(error => {
      console.error('Error transcribing audio:', error);
      transcriptionOutput.textContent = 'Error transcribing audio.';
    });
  }
  
  // Helper function to convert array buffer to base64
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  




  // waveform

  document.getElementById('audioFile').addEventListener('change', function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    
    reader.onload = function(event) {
        var arrayBuffer = event.target.result;
        visualize(arrayBuffer);
    };
    
    reader.readAsArrayBuffer(file);
});

function visualize(arrayBuffer) {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        var canvas = document.getElementById('waveform');
        var context = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        var data = audioBuffer.getChannelData(0);
        var step = Math.ceil(data.length / width);
        var amp = height / 2;
        
        context.fillStyle = 'rgb(200, 200, 200)';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.lineWidth = 1;
        context.beginPath();
        
        for (var i = 0; i < width; i++) {
            var min = 1.0;
            var max = -1.0;
            
            for (var j = 0; j < step; j++) {
                var datum = data[(i * step) + j];
                if (datum < min)
                    min = datum;
                if (datum > max)
                    max = datum;
            }
            
            context.moveTo(i, (1 + min) * amp);
            context.lineTo(i, (1 + max) * amp);
        }
        
        context.stroke();
    });
}



  // waveform

window.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio');
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');

  const audioContext = new AudioContext();
  const audioSource = audioContext.createMediaElementSource(audio);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);

  function drawWaveform() {
      requestAnimationFrame(drawWaveform);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) {
              ctx.moveTo(x, y);
          } else {
              ctx.lineTo(x, y);
          }
          x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
  }

  drawWaveform();
});



// demo 2

window.onload = function() {
  const audioFileInput = document.getElementById('audioFileInput');
  const audioPlayer = document.getElementById('audioPlayer');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const ctx = waveformCanvas.getContext('2d');

  audioFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioData = e.target.result;

      audioPlayer.src = audioData;
      visualizeAudio(audioContext, audioData);
    };

    reader.readAsDataURL(file);
  });

  function visualizeAudio(audioContext, audioData) {
    audioContext.decodeAudioData(arrayBufferFromBase64(audioData), function(buffer) {
      drawWaveform(buffer);
    });
  }

  function arrayBufferFromBase64(base64) {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function drawWaveform(buffer) {
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / waveformCanvas.width);
    const amp = waveformCanvas.height / 2;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.beginPath();
    ctx.moveTo(0, waveformCanvas.height / 2);

    for (let i = 0; i < waveformCanvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        let datum = data[(i * step) + j];
        if (datum < min) {
          min = datum;
        }
        if (datum > max) {
          max = datum;
        }
      }
      ctx.lineTo(i, (1 + min) * amp);
    }
    ctx.stroke();
  }
};
