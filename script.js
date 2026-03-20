const songs = [
    { id: 1, title: "Consume", artist: "Chase Atlantic", img: "1.jpg", vidId: "vd1", audio: "consume.mp3" },
    { id: 2, title: "Perfect", artist: "Ed Sheeran", img: "https://i.scdn.co/image/ab67616d0000b2731885b5d3a5a7566160356c9e", vidId: "vd2", audio: "perfect.mp3" },
    { id: 3, title: "Unconditionally", artist: "Katy Perry", img: "https://i.scdn.co/image/ab67616d0000b27354964177d853b927ac400405", vidId: "vd3", audio: "unconditionally.mp3" },
    { id: 4, title: "Rewrite the Stars", artist: "James Arthur & Anne-Marie", img: "https://i.scdn.co/image/ab67616d0000b273463a56f66314811a24856f70", vidId: "vd4", audio: "rewrite.mp3" },
    { id: 5, title: "Somebody's Pleasure", artist: "Aziz Hedra", img: "https://i.scdn.co/image/ab67616d0000b273b5336d3338e5e783da6f0b3b", vidId: "vd5", audio: "pleasure.mp3" },
    { id: 6, title: "I Wanna Be Yours", artist: "Arctic Monkeys", img: "https://i.scdn.co/image/ab67616d0000b273d2a7042f4949544c82c6407b", vidId: "vd6", audio: "yours.mp3" }
];

const playlistContainer = document.getElementById('playlist');
const audioPlayer = new Audio(); 
let lastActiveIndex = -1; // VARIABEL PENTING: Mencegah lirik patah-patah karena render berulang

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

// --- LOGIKA TIMEUPDATE (SINKRONISASI LIRIK OPTIMASI) ---
audioPlayer.addEventListener('timeupdate', () => {
    const barFill = document.querySelector('.bar-fill');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const lyricsContainer = document.getElementById('detail-lyrics');
    
    if (currentTimeEl) currentTimeEl.innerText = formatTime(audioPlayer.currentTime);
    
    if (audioPlayer.duration) {
        if (durationEl) durationEl.innerText = formatTime(audioPlayer.duration);
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (barFill) barFill.style.width = `${progressPercent}%`;

        // Logika Sinkronisasi Lirik
        const currentSong = songs.find(s => audioPlayer.src.includes(s.audio));
        if (currentSong && typeof songLyrics !== 'undefined' && songLyrics[currentSong.id]) {
            const lyricsData = songLyrics[currentSong.id];
            
            // Cari lirik mana yang harus aktif berdasarkan waktu
            let activeIndex = -1;
            for (let i = 0; i < lyricsData.length; i++) {
                if (audioPlayer.currentTime >= lyricsData[i].time) {
                    activeIndex = i;
                } else {
                    break;
                }
            }

            // HANYA UPDATE JIKA LIRIKNYA BERUBAH (Ini yang bikin lancar)
            if (activeIndex !== -1 && activeIndex !== lastActiveIndex) {
                lastActiveIndex = activeIndex;

                // Bersihkan class lama
                document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active-lyric'));
                
                const lineEl = document.getElementById(`line-${activeIndex}`);
                if (lineEl) {
                    lineEl.classList.add('active-lyric');
                    
                    // Scroll manual ke tengah container (Lebih smooth & stabil)
                    if (lyricsContainer) {
                        const containerHeight = lyricsContainer.offsetHeight;
                        const lineOffset = lineEl.offsetTop;
                        const lineHeight = lineEl.offsetHeight;
                        const targetScroll = lineOffset - (containerHeight / 2) + (lineHeight / 2);
                        
                        lyricsContainer.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    const durationEl = document.getElementById('duration');
    if (durationEl) durationEl.innerText = formatTime(audioPlayer.duration);
});

// --- SHOWDETAIL (MENGAMBIL DATA DARI LYRICS.JS) ---
function showDetail(song) {
    const p1 = document.getElementById('page-1');
    const p2 = document.getElementById('page-2');
    const playBtn = document.querySelector('.play-btn');
    const detailVideoBg = document.getElementById('detail-video-bg');
    const lyricsContainer = document.getElementById('detail-lyrics');

    // Reset index lirik setiap ganti lagu
    lastActiveIndex = -1;

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
    
    if (lyricsContainer) {
        lyricsContainer.innerHTML = '';
        if (typeof songLyrics !== 'undefined' && songLyrics[song.id]) {
            songLyrics[song.id].forEach((line, index) => {
                const p = document.createElement('p');
                p.className = 'lyric-line';
                p.id = `line-${index}`;
                p.innerText = line.text;
                lyricsContainer.appendChild(p);
            });
        } else {
            lyricsContainer.innerText = "Lyrics not available.";
        }
        lyricsContainer.scrollTop = 0;
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
        if (detailVideoBg) detailVideoBg.pause();

        setTimeout(() => {
            if (p2) p2.classList.add('hidden');
            if (p1) p1.classList.remove('hidden');
        }, 400);
    }
});

displaySongs();
