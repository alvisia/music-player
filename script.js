// DOM Elements
const image = document.querySelector('img');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const music = document.querySelector('audio');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

// Songs
const songs = [
    {
        name: 'alexgrohl-punk-rock',
        displayName: 'Punk Rock',
        artist: 'AlexGrohl',
    },
    {
        name: 'dimmysad-best-day-of-my-life',
        displayName: 'Best Day Of My Life',
        artist: 'DIMMYSAD',
    },
    {
        name: 'keyframe_audio-jacket',
        displayName: 'Jacket',
        artist: 'Keyframe_Audio',
    },
    {
        name: 'nastelbom-driving',
        displayName: 'Driving',
        artist: 'NastelBom',
    },
    {
        name: 'song_writing_by_brad-groundhog-day',
        displayName: 'Groundhog Day',
        artist: 'Song_Writing_by_Brad',
    }
];

// State
let isPlaying = false; // Check if playing
let songIndex = 0; // Current Song
let isVisualizerReady = false;

// Audio Visualizer
const audioContext = new AudioContext(); // Browser's audio processing system
const analyser = audioContext.createAnalyser(); // Extracts frequency data in real time
analyser.fftSize = 256; // Number of frequency bars = fftSize / 2 (128 bars)
const barCount = analyser.frequencyBinCount; // Total number of bars to draw
const frequencyDataArray = new Uint8Array(barCount); // Holds frequency values (0-255) for each bar
let animationId; // Store requestAnimationFrame() ID for cancellation
let barHeightsArray = new Array(barCount).fill(0); // Tracks bar heights for smooth fade out on pause

// Play
function playSong() {
    isPlaying = true;
    playBtn.classList.replace('fa-play', 'fa-pause');
    playBtn.setAttribute('title', 'Pause');
    music.play();
    image.classList.add('playing');
    if (!isVisualizerReady) {
        setupVisualizer();
        // Resume audio context if suspended (browsers suspend by default until user interaction)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        isVisualizerReady = true;
    }
}

// Pause
function pauseSong() {
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
    music.pause();
    image.classList.remove('playing');
}

// Update song title, artist, audio source and album art
function loadSong(song) {
    title.textContent = song.displayName;
    artist.textContent = song.artist;
    music.src = `music/${song.name}.mp3`;
    image.src = `img/${song.name}.jpg`;
}

// Previous Song
function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = songs.length - 1;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// Next Song
function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// Update progress bar width and time display on each timeupdate event
function updateProgressBar(event) {
    if (isPlaying) {
        const { duration, currentTime } = event.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        // Format duration
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) {
            durationSeconds = `0${durationSeconds}`;
        }
        // Delay switching the duration display to avoid NaN on load
        if (durationSeconds) {
            durationEl.textContent = `${durationMinutes}:${durationSeconds}`;            
        }
        // Format current time
        const currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = Math.floor(currentTime % 60);
        if (currentSeconds < 10) {
            currentSeconds = `0${currentSeconds}`;
        }
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
    }
}

// Seek to clicked position on progress bar
function setProgressBar(event) {
    const width = this.clientWidth;
    const clickX = event.offsetX; // Distance clicked from left edge of progress bar
    const { duration } = music;
    music.currentTime = (clickX / width) * duration; // Convert click percentage to seconds
}

// Connect audio element to analyser node and start visualizer
function setupVisualizer() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const source = audioContext.createMediaElementSource(music);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    drawBars();
}

// Draw frequency bars on canvas, called every frame via requestAnimationFrame
function drawBars() {
    analyser.getByteFrequencyData(frequencyDataArray); // Fill array with current frequency values
    // Clear canvas with background color
    canvasCtx.fillStyle = '#0a0a0a';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / barCount * 3; // Get width of each bar
    // Draw each bar with current frequency data
    frequencyDataArray.forEach((value, i) => {
        // When music playing update bar height, when paused gradually shrink bars
        if (isPlaying) {
            barHeightsArray[i] = value;
        } else {
            barHeightsArray[i] *= 0.9;
        }
        const barHeight = barHeightsArray[i];
        canvasCtx.fillStyle = `rgb(${value}, 0, 0)`;
        canvasCtx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    });
    // drawBars every frame & store requestAnimationFrame ID
    animationId = requestAnimationFrame(drawBars);
}

// On Load - Select first song
loadSong(songs[songIndex]);

// Event Listeners
playBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
music.addEventListener('ended', nextSong);
music.addEventListener('timeupdate', updateProgressBar);
progressContainer.addEventListener('click', setProgressBar);