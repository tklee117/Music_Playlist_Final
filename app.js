// DOM 요소
const playlistsScreen = document.getElementById('playlists-screen');
const playerScreen = document.getElementById('player-screen');
const playlistsContainer = document.getElementById('playlists-container');
const playlistSongs = document.getElementById('playlist-songs');
const backButton = document.getElementById('back-button');
const currentPlaylistTitle = document.getElementById('current-playlist-title');
const currentAlbumCover = document.getElementById('current-album-cover');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const prevButton = document.getElementById('prev-button');
const playPauseButton = document.getElementById('play-pause-button');
const nextButton = document.getElementById('next-button');
const playIcon = document.getElementById('play-icon');
const lyricsButton = document.getElementById('lyrics-button');
const lyricsContainer = document.getElementById('lyrics-container');
const lyricsText = document.getElementById('lyrics-text');

// 플레이어 상태
let currentPlaylist = null;
let currentSongIndex = 0;
let isPlaying = false;
let audioPlayer = new Audio();

// 플레이리스트 데이터 가져오기
fetch('playlists.json')
    .then(response => response.json())
    .then(data => {
        renderPlaylists(data);
    })
    .catch(error => {
        console.error('Error loading playlists:', error);
        playlistsContainer.innerHTML = '<p>플레이리스트를 불러오는 중 오류가 발생했습니다.</p>';
    });

// 플레이리스트 렌더링
function renderPlaylists(playlists) {
    playlistsContainer.innerHTML = '';
    
    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        playlistCard.dataset.id = playlist.id;
        
        playlistCard.innerHTML = `
            <div class="playlist-cover">
                <img src="${playlist.coverUrl || 'default-cover.jpg'}" alt="${playlist.title}">
            </div>
            <div class="playlist-info">
                <h3>${playlist.title}</h3>
                <p>${playlist.songs.length}곡</p>
            </div>
        `;
        
        playlistCard.addEventListener('click', () => openPlaylist(playlist));
        playlistsContainer.appendChild(playlistCard);
    });
}

// 플레이리스트 열기
function openPlaylist(playlist) {
    currentPlaylist = playlist;
    currentSongIndex = 0;
    
    currentPlaylistTitle.textContent = playlist.title;
    renderPlaylistSongs(playlist);
    
    playlistsScreen.classList.remove('active-screen');
    playlistsScreen.classList.add('hidden-screen');
    playerScreen.classList.remove('hidden-screen');
    playerScreen.classList.add('active-screen');
    
    // 첫 번째 곡 로드
    loadSong(0);
}

// 플레이리스트 곡 렌더링
function renderPlaylistSongs(playlist) {
    playlistSongs.innerHTML = '';
    
    playlist.songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        if (index === currentSongIndex) {
            songItem.classList.add('active');
        }
        
        songItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <div class="song-item-details">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
            <div class="song-duration">${formatTime(song.duration)}</div>
        `;
        
        songItem.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
        
        playlistSongs.appendChild(songItem);
    });
}

// 곡 로드
function loadSong(index) {
    if (!currentPlaylist || !currentPlaylist.songs[index]) return;
    
    const song = currentPlaylist.songs[index];
    
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentAlbumCover.src = song.coverUrl || currentPlaylist.coverUrl || 'default-cover.jpg';
    
    audioPlayer.src = song.url;
    audioPlayer.load();
    
    updateActiveSongInPlaylist();
    
    // 가사 버튼 설정
    if (song.lyrics) {
        lyricsButton.style.display = 'block';
        lyricsText.textContent = song.lyrics;
    } else {
        lyricsButton.style.display = 'block';
        lyricsText.textContent = '가사를 사용할 수 없습니다.';
    }
    
    lyricsContainer.classList.add('hidden');
}

// 활성 곡 업데이트
function updateActiveSongInPlaylist() {
    const songItems = playlistSongs.querySelectorAll('.song-item');
    songItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 곡 재생
function playSong() {
    audioPlayer.play();
    isPlaying = true;
    playIcon.classList.remove('fa-play');
    playIcon.classList.add('fa-pause');
}

// 곡 일시정지
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.classList.remove('fa-pause');
    playIcon.classList.add('fa-play');
}

// 이전 곡
function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = currentPlaylist.songs.length - 1;
    }
    loadSong(currentSongIndex);
    playSong();
}

// 다음 곡
function nextSong() {
    currentSongIndex++;
    if (currentSongIndex >= currentPlaylist.songs.length) {
        currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    playSong();
}

// 시간 포맷 변환
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 오디오 이벤트 리스너
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration || 0;
    
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    currentTimeElement.textContent = formatTime(currentTime);
    if (!isNaN(duration)) {
        durationElement.textContent = formatTime(duration);
    }
});

audioPlayer.addEventListener('ended', () => {
    nextSong();
});

// 이벤트 리스너
backButton.addEventListener('click', () => {
    pauseSong();
    playerScreen.classList.remove('active-screen');
    playerScreen.classList.add('hidden-screen');
    playlistsScreen.classList.remove('hidden-screen');
    playlistsScreen.classList.add('active-screen');
});

playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevButton.addEventListener('click', prevSong);
nextButton.addEventListener('click', nextSong);

progressBar.addEventListener('click', (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    audioPlayer.currentTime = (clickX / width) * duration;
});

lyricsButton.addEventListener('click', () => {
    lyricsContainer.classList.toggle('hidden');
});

// YouTube Data API를 사용하기 위한 준비 (선택적)
// 가사를 자동으로 불러오거나 YouTube에서 추가 정보를 가져오기 위해 
// 실제 구현 시에는 YouTube Data API 키가 필요합니다.
function searchYouTubeInfo(songTitle, artist) {
    // YouTube API 통합 구현
    // 실제 사용 시 YouTube Data API 키를 발급받아 사용해야 합니다.
    console.log('Searching YouTube for:', songTitle, 'by', artist);
} 