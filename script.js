const songs = [
    { 
        id: 1, // Tambahkan ID untuk hubungkan ke bg-detail-1
        title: "Consume", 
        artist: "Chase Atlantic", 
        img: "1.jpg", 
        vidId: "vd1",
        audio: "consume.mp3", 
        lyrics: "She said, Careful, or you'll lose it<br>But, girl, I'm only human,<br>And I know there's a blade where your heart is..." 
    },
    { id: 2, title: "Perfect", artist: "Ed Sheeran", img: "https://i.scdn.co/image/ab67616d0000b2731885b5d3a5a7566160356c9e", vidId: "vd2", audio: "perfect.mp3", lyrics: "I found a love, for me..." },
    { id: 3, title: "Unconditionally", artist: "Katy Perry", img: "https://i.scdn.co/image/ab67616d0000b27354964177d853b927ac400405", vidId: "vd3", audio: "unconditionally.mp3", lyrics: "Oh no, did I get too close?" },
    { id: 4, title: "Rewrite the Stars", artist: "James Arthur & Anne-Marie", img: "https://i.scdn.co/image/ab67616d0000b273463a56f66314811a24856f70", vidId: "vd4", audio: "rewrite.mp3", lyrics: "You know I want you..." },
    { id: 5, title: "Somebody's Pleasure", artist: "Aziz Hedra", img: "https://i.scdn.co/image/ab67616d0000b273b5336d3338e5e783da6f0b3b", vidId: "vd5", audio: "pleasure.mp3", lyrics: "Soul try to figure it out..." },
    { id: 6, title: "I Wanna Be Yours", artist: "Arctic Monkeys", img: "https://i.scdn.co/image/ab67616d0000b273d2a7042f4949544c82c6407b", vidId: "vd6", audio: "yours.mp3", lyrics: "I wanna be your vacuum cleaner..." }
];

const playlistContainer = document.getElementById('playlist');
const audioPlayer = new Audio(); 

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function displaySongs() {
    if(!playlistContainer) return;
    playlistContainer.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.img}" alt="Cover" class="album-art">
            <div class="song-info">
                <span class="song-title">${song.title}</span>
                <span class="artist-name">${song.artist}</span>
            </div>
        `;

        const targetVideo = document.getElementById(song.vidId);
        let startTime = 0;
        let isPressed = false; 

        card.addEventListener('pointerdown', (e) => {
            isPressed = true; 
            startTime = Date.now(); 
            if (targetVideo) {
                targetVideo.classList.add('show-video');
                targetVideo.play().catch(() => {});
            }
        });

        card.addEventListener('pointerup', (e) => {
            if (!isPressed) return;
            if (targetVideo) {
                targetVideo.classList.remove('show-video');
                targetVideo.pause();
                targetVideo.currentTime = 0;
            }
            const duration = Date.now() - startTime;
            if (duration < 250 && startTime !== 0) {
                showDetail(song);
            }
            isPressed = false;
            startTime = 0;
        });

        card.addEventListener('pointerleave', () => {
            if (isPressed) {
                if (targetVideo) {
                    targetVideo.classList.remove('show-video');
                    targetVideo.pause();
                }
                isPressed = false;
                startTime = 0;
            }
        });

        playlistContainer.appendChild(card);
    });
}

audioPlayer.addEventListener('timeupdate', () => {
    const barFill = document.querySelector('.bar-fill');
    const lyricsContainer = document.querySelector('.lyrics-container');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    
    if (currentTimeEl) currentTimeEl.innerText = formatTime(audioPlayer.currentTime);
    
    if (audioPlayer.duration) {
        if (durationEl) durationEl.innerText = formatTime(audioPlayer.duration);
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (barFill) barFill.style.width = `${progressPercent}%`;
        if (lyricsContainer) {
            const scrollTarget = (audioPlayer.currentTime / audioPlayer.duration) * (lyricsContainer.scrollHeight - lyricsContainer.clientHeight);
            lyricsContainer.scrollTop = scrollTarget;
        }
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    const durationEl = document.getElementById('duration');
    if (durationEl) durationEl.innerText = formatTime(audioPlayer.duration);
});

// --- PERBAIKAN SHOWDETAIL (HUBUNGKAN VIDEO HAL 2) ---
function showDetail(song) {
    const p1 = document.getElementById('page-1');
    const p2 = document.getElementById('page-2');
    const playBtn = document.querySelector('.play-btn');
    const detailVideoBg = document.getElementById('detail-video-bg');

    // Ambil video dari 'video-detail-list' (bg-detail-1, dst)
    const sourceVideoDetail = document.getElementById('bg-detail-' + song.id);
    if (detailVideoBg && sourceVideoDetail) {
        const videoFile = sourceVideoDetail.querySelector('source').src;
        detailVideoBg.src = videoFile;
        detailVideoBg.load();
        detailVideoBg.play().catch(() => {});
    }

    if (document.getElementById('detail-img')) document.getElementById('detail-img').src = song.img;
    if (document.getElementById('detail-title')) document.getElementById('detail-title').innerText = song.title;
    if (document.getElementById('detail-artist')) document.getElementById('detail-artist').innerText = song.artist;
    if (document.getElementById('detail-lyrics')) {
        document.getElementById('detail-lyrics').innerHTML = song.lyrics || "Lyrics not available.";
        document.getElementById('detail-lyrics').scrollTop = 0;
    }

    const barFill = document.querySelector('.bar-fill');
    if (barFill) barFill.style.width = '0%';

    audioPlayer.src = song.audio;
    audioPlayer.play().catch(e => console.log("Audio play error:", e));
    
    if (playBtn) playBtn.innerHTML = '<span class="material-icons">pause</span>';

    if (p1 && p2) {
        p1.classList.add('hidden');
        p2.classList.remove('hidden');
        setTimeout(() => { p2.classList.add('active'); }, 10);
    }
}

document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.play-btn');
    if (playBtn) {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playBtn.innerHTML = '<span class="material-icons">pause</span>';
        } else {
            audioPlayer.pause();
            playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        }
    }

    const backBtn = e.target.closest('#btn-back');
    if (backBtn) {
        const p1 = document.getElementById('page-1');
        const p2 = document.getElementById('page-2');
        const detailVideoBg = document.getElementById('detail-video-bg');

        if (p2) p2.classList.remove('active');
        audioPlayer.pause();
        
        // Matikan video background saat keluar
        if (detailVideoBg) detailVideoBg.pause();

        setTimeout(() => {
            if (p2) p2.classList.add('hidden');
            if (p1) p1.classList.remove('hidden');
        }, 400);
    }
});

displaySongs();
