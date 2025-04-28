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
let player = null;
let progressInterval = null;

// YouTube API 로드
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTube 플레이어가 준비되면 호출되는 함수
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API Ready');
    // 플레이어 생성은 첫 곡 선택시 생성됨
    
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
};

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

// YouTube 동영상 ID 추출 함수
function getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 곡 로드
function loadSong(index) {
    if (!currentPlaylist || !currentPlaylist.songs[index]) return;
    
    const song = currentPlaylist.songs[index];
    
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentAlbumCover.src = song.coverUrl || currentPlaylist.coverUrl || 'default-cover.jpg';
    
    // 기존 진행 타이머 정리
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // YouTube 동영상 ID 추출
    const videoId = getYoutubeVideoId(song.url);
    
    if (!videoId) {
        console.error('Invalid YouTube URL:', song.url);
        return;
    }
    
    // YouTube 플레이어 초기화 또는 업데이트
    if (!player) {
        // 숨겨진 YouTube 플레이어 컨테이너 생성
        const playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player';
        playerContainer.style.position = 'absolute';
        playerContainer.style.top = '-9999px';
        playerContainer.style.left = '-9999px';
        document.body.appendChild(playerContainer);
        
        // 플레이어 생성
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    } else {
        // 기존 플레이어에 새 영상 로드
        player.loadVideoById(videoId);
        player.pauseVideo();
    }
    
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

// YouTube 플레이어 준비 완료 핸들러
function onPlayerReady(event) {
    durationElement.textContent = formatTime(currentPlaylist.songs[currentSongIndex].duration);
    event.target.pauseVideo();
    isPlaying = false;
    playIcon.className = 'fas fa-play';
}

// YouTube 플레이어 상태 변경 핸들러
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // 곡이 끝나면 다음 곡으로
        nextSong();
    } else if (event.data === YT.PlayerState.PLAYING) {
        // 재생 시작 시 진행 상태 업데이트 시작
        startProgressUpdate();
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
    } else if (event.data === YT.PlayerState.PAUSED) {
        // 일시정지 시 진행 상태 업데이트 중지
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        isPlaying = false;
        playIcon.className = 'fas fa-play';
    }
}

// 곡 진행 상태 업데이트
function startProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(() => {
        if (player && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
            
            currentTimeElement.textContent = formatTime(currentTime);
            durationElement.textContent = formatTime(duration);
        }
    }, 1000);
}

// 활성 곡 표시 업데이트
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
    if (player && player.playVideo) {
        player.playVideo();
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
        startProgressUpdate();
    }
}

// 곡 일시정지
function pauseSong() {
    if (player && player.pauseVideo) {
        player.pauseVideo();
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }
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

// 시간 포맷 변환 (초 -> MM:SS)
function formatTime(seconds) {
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 이벤트 리스너 설정
backButton.addEventListener('click', () => {
    if (player && player.pauseVideo) {
        player.pauseVideo();
    }
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    playlistsScreen.classList.remove('hidden-screen');
    playlistsScreen.classList.add('active-screen');
    playerScreen.classList.remove('active-screen');
    playerScreen.classList.add('hidden-screen');
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

lyricsButton.addEventListener('click', () => {
    lyricsContainer.classList.toggle('hidden');
});

progressBar.addEventListener('click', (e) => {
    if (player && player.getDuration) {
        const duration = player.getDuration();
        const clickPosition = e.offsetX / progressBar.offsetWidth;
        const seekTime = duration * clickPosition;
        
        player.seekTo(seekTime, true);
    }
});

// 유튜브에서 정보 검색 (썸네일, 제목, 아티스트)
function searchYouTubeInfo(songTitle, artist) {
    // 실제 구현에서는 YouTube Data API를 사용하여 검색 기능 구현 필요
    // API 키가 필요하기 때문에 여기서는 더미 함수로 구현
    console.log(`Searching for: ${songTitle} by ${artist}`);
} 