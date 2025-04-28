// 가족 구성원 데이터
const familyMembers = [
    { name: '엄마', image: './images/family/mom.png', sound: './sounds/mom.mp3' },
    { name: '아빠', image: './images/family/dad.png', sound: './sounds/dad.mp3' },
    { name: '서준', image: './images/family/seojun.png', sound: './sounds/seojun.mp3' },
    { name: '서진', image: './images/family/seojin.png', sound: './sounds/seojin.mp3' },
    { name: '할매', image: './images/family/grandma1.png', sound: './sounds/grandma1.mp3' },
    { name: '할배', image: './images/family/grandpa1.png', sound: './sounds/grandpa1.mp3' },
    { name: '할머니', image: './images/family/grandma2.png', sound: './sounds/grandma2.mp3' },
    { name: '건돌이', image: './images/family/gundol.png', sound: './sounds/gundol.mp3' }
];

// 기차 데이터
const trains = [
    { id: 'hayabusa', name: '하야부사', image: './images/train/hayabusa.png', sound: './sounds/train/hayabusa.mp3' },
    { id: 'komachi', name: '코마치', image: './images/train/komachi.png', sound: './sounds/train/komachi.mp3' },
    { id: 'makukaje', name: '마쿠카제', image: './images/train/makukaje.png', sound: './sounds/train/makukaje.mp3' },
    { id: 'tubame', name: '츠바메', image: './images/train/tubame.png', sound: './sounds/train/tubame.mp3' },
    { id: 'hakataka', name: '하카타카', image: './images/train/hakataka.png', sound: './sounds/train/hakataka.mp3' },
    { id: 'hokuriku', name: '호쿠리쿠', image: './images/train/hokuriku.png', sound: './sounds/train/hokuriku.mp3' }
];

let currentTarget = null;
let bgm = document.getElementById('bgm');
let correctSound = document.getElementById('correct-sound');
let wrongSound = document.getElementById('wrong-sound');
let popupSound = new Audio('./sounds/popup.mp3');
let isBgmPlaying = false;

// 페이지와 상호작용 시 음악 재생
function startBGM() {
    bgm.volume = 0.15;
    bgm.loop = true;
    bgm.play();
    isBgmPlaying = true;
    document.getElementById('bgm-toggle').textContent = '🔊';
}

// 페이지 클릭, 키보드 입력, 터치 등 모든 상호작용에서 음악 시작
window.addEventListener('click', startBGM, { once: true });
window.addEventListener('keydown', startBGM, { once: true });
window.addEventListener('touchstart', startBGM, { once: true });

// 페이지 로드 시에도 시도
window.addEventListener('load', function() {
    startBGM();
});

// 배경음악 토글
document.getElementById('bgm-toggle').addEventListener('click', function() {
    const button = this;
    if (isBgmPlaying) {
        bgm.pause();
        button.textContent = '🔈';
        button.classList.add('muted');
        isBgmPlaying = false;
    } else {
        bgm.play();
        button.textContent = '🔊';
        button.classList.remove('muted');
        isBgmPlaying = true;
    }
});

// 오디오 객체 풀 생성
const audioPool = {};

// 오디오 초기화 및 프리로드
function initAudio() {
    // 가족 구성원 오디오
    familyMembers.forEach(member => {
        audioPool[member.name] = new Audio(member.sound);
        audioPool[member.name].load(); // 프리로드
    });

    // 기차 오디오
    trains.forEach(train => {
        audioPool[train.name] = new Audio(train.sound);
        audioPool[train.name].load(); // 프리로드
    });

    // 효과음 프리로드
    correctSound.volume = 0.3;
    wrongSound.volume = 0.3;
    popupSound.volume = 0.3;
    correctSound.load();
    wrongSound.load();
    popupSound.load();
    bgm.load();
}

// 팝업 표시 함수
function showTargetPopup(familyMember) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'target-popup';
    
    const img = document.createElement('img');
    img.src = familyMember.image;
    img.alt = familyMember.name;
    
    const text = document.createElement('p');
    text.textContent = `${familyMember.name}를(을) 찾아보세요!`;
    
    popup.appendChild(img);
    popup.appendChild(text);
    overlay.appendChild(popup);
    
    document.body.appendChild(overlay);

    // 효과음 미리 로드
    popupSound.load();
    
    // 클릭하면 팝업 닫기
    overlay.addEventListener('click', () => {
        // 효과음 즉시 재생
        popupSound.currentTime = 0;
        const playPromise = popupSound.play();
        
        // 효과음 재생 후 팝업 제거
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 50);
    });
}

// 터널 클릭 처리
function handleTunnelClick(event) {
    const tunnel = event.currentTarget;
    if (tunnel.classList.contains('revealed')) return;
    
    tunnel.classList.add('revealed');
    
    // 사운드 재생 (프리로드된 오디오 사용)
    const audio = audioPool[tunnel.dataset.name];
    if (audio) {
        audio.currentTime = 0; // 재생 위치 초기화
        audio.play();
    }
    
    if (tunnel.dataset.content === 'family' && tunnel.dataset.name === currentTarget.name) {
        tunnel.classList.add('correct');
        correctSound.currentTime = 0;
        correctSound.play();
        setTimeout(() => {
            alert('정답입니다! 🎉');
            initializeGame();
        }, 1000);
    } else {
        tunnel.classList.add('wrong');
        wrongSound.currentTime = 0;
        wrongSound.play();
    }
}

// 게임 초기화
function initializeGame() {
    const container = document.querySelector('.train-container');
    container.innerHTML = '';
    
    // 현재 목표 가족 구성원 선택
    currentTarget = familyMembers[Math.floor(Math.random() * familyMembers.length)];
    document.getElementById('find-target-message').textContent = `${currentTarget.name}를(을) 찾아보세요!`;
    
    // 팝업으로 목표 가족 구성원 보여주기
    showTargetPopup(currentTarget);
    
    // 기차 터널 생성
    const shuffledTrains = [...trains];
    shuffleArray(shuffledTrains);
    
    // 랜덤 위치에 목표 가족 구성원 배치
    const targetPosition = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < 6; i++) {
        const tunnel = document.createElement('div');
        tunnel.className = 'tunnel';
        
        const tunnelInner = document.createElement('div');
        tunnelInner.className = 'tunnel-inner';
        
        // 터널 이미지
        const tunnelImg = document.createElement('img');
        tunnelImg.className = 'tunnel-image';
        tunnelImg.src = './images/tunnel1.png';
        tunnelInner.appendChild(tunnelImg);
        
        // 기차/가족 이미지
        const contentImg = document.createElement('img');
        if (i === targetPosition) {
            contentImg.className = 'photo';
            contentImg.src = currentTarget.image;
            tunnel.dataset.content = 'family';
            tunnel.dataset.name = currentTarget.name;
        } else {
            contentImg.className = 'train-image';
            contentImg.src = shuffledTrains[i > targetPosition ? i - 1 : i].image;
            tunnel.dataset.content = 'train';
            tunnel.dataset.name = shuffledTrains[i > targetPosition ? i - 1 : i].name;
        }
        tunnelInner.appendChild(contentImg);
        
        // 이름 레이블
        const nameLabel = document.createElement('div');
        nameLabel.className = 'name-label';
        nameLabel.textContent = tunnel.dataset.name;
        tunnelInner.appendChild(nameLabel);
        
        tunnel.appendChild(tunnelInner);
        
        // 클릭 이벤트
        tunnel.addEventListener('click', handleTunnelClick);
        container.appendChild(tunnel);
    }
}

// 게임 시작 시 오디오 초기화
initAudio();

// 게임 시작
document.getElementById('restart-button').addEventListener('click', initializeGame);
initializeGame();

// 배열 섞기 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
} 