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

// Music
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

// Check if playing
let isPlaying = false;

// Play
function playSong() {
    isPlaying = true;
    playBtn.classList.replace('fa-play', 'fa-pause');
    playBtn.setAttribute('title', 'Pause');
    music.play();
    image.classList.add('playing');
}

// Pause
function pauseSong() {
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
    music.pause();
    image.classList.remove('playing');
}

// Play or Pause Event Listener
playBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));

// Update DOM
function loadSong(song) {
    title.textContent = song.displayName;
    artist.textContent = song.artist;
    music.src = `music/${song.name}.mp3`;
    image.src = `img/${song.name}.jpg`;
}

// Current Song
let songIndex = 0;

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

// On Load - Select first song
loadSong(songs[songIndex]);

// Update Progress Bar & Time
function updateProgressBar(event) {
    if (isPlaying) {
        const { duration, currentTime } = event.srcElement;
        // Update progress bar width
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        // Calculate the display for duration
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) {
            durationSeconds = `0${durationSeconds}`;
        }
        // Delay switching the duration Element to avoid NaN
        if (durationSeconds) {
        durationEl.textContent = `${durationMinutes}:${durationSeconds}`;            
        }
        // Calculate the display for current
        const currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = Math.floor(currentTime % 60);
        if (currentSeconds < 10) {
            currentSeconds = `0${currentSeconds}`;
        }
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
    }
}

// Set Progress Bar
function setProgressBar(event) {
    const width = this.clientWidth;
    const clickX = event.offsetX; // offsetX returns how far I clicked from the left of the container in pixels
    const { duration } = music;
    music.currentTime = (clickX / width) * duration; // (clickX / width) calcualtes the percentage just like a grade. (clickX / width) * duration converts it into seconds.
}

// Event Listeners
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
music.addEventListener('ended', nextSong);
music.addEventListener('timeupdate', updateProgressBar);
progressContainer.addEventListener('click', setProgressBar);