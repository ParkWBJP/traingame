const introScreen = document.getElementById('intro-screen');
const uploadScreen = document.getElementById('upload-screen');
const gameStartScreen = document.getElementById('game-start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const settingsScreen = document.getElementById('settings-screen');

const goToUploadButton = document.getElementById('go-to-upload');
const savePhotosButton = document.getElementById('save-photos');
const startGameButton = document.getElementById('start-game');
const replayButton = document.getElementById('replay-button');
const goToIntroButtonSettings = document.getElementById('go-to-intro');

const photoInputsDiv = document.getElementById('photo-inputs');
const familyPhotosPreview = document.getElementById('family-photos-preview');
const findTargetMessage = document.getElementById('find-target-message');
const trainContainer = document.querySelector('.train-container');
const finalTargetPhoto = document.getElementById('final-target-photo');
const congratulationsMessage = document.getElementById('congratulations-message');
const uploadedPhotosList = document.getElementById('uploaded-photos-list');
const languageSelect = document.getElementById('language-select');

// 오디오 요소 참조
/*const trainSound = document.getElementById('train-sound');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');
const winSound = document.getElementById('win-sound');*/

let familyPhotos = [];
let targetFamilyMember = null;
let revealedCount = 0;
const numberOfTunnels = 6;
const trainTypes = [
    { id: 'hayabusa', name: '하야부사', color: 'mint' },
    { id: 'komachi', name: '코마치', color: 'pink' },
    { id: 'makukaje', name: '마쿠카제', color: 'white' },
    { id: 'tubame', name: '쓰바메', color: 'blue' },
    { id: 'hakataka', name: '하카타카', color: 'white' },
    { id: 'hokuriku', name: '호쿠리쿠', color: 'mint' }
];

// 초기 설정: 인트로 화면 보여주기
introScreen.style.display = 'block';
// trainSound.play(); // 효과음 파일이 없으면 에러가 날 수 있으므로 일단 주석 처리

// 배열을 무작위로 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// "가족사진 등록하러 가기" 버튼 클릭 시
goToUploadButton.addEventListener('click', () => {
    introScreen.style.display = 'none';
    uploadScreen.style.display = 'block';
    // trainSound.pause(); // 효과음 주석 처리
});

// 사진 입력 필드 동적 생성 (최대 5개)
for (let i = 1; i <= 5; i++) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.setAttribute('for', `photo${i}`);
    label.textContent = `사진 ${i}:`;
    const inputPhoto = document.createElement('input');
    inputPhoto.type = 'file';
    inputPhoto.id = `photo${i}`;
    inputPhoto.name = 'photo';
    inputPhoto.accept = 'image/*';
    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.id = `name${i}`;
    inputName.placeholder = '이름';
    div.appendChild(label);
    div.appendChild(inputPhoto);
    div.appendChild(inputName);
    photoInputsDiv.appendChild(div);
}

// "사진 저장 및 게임 시작" 버튼 클릭 시
savePhotosButton.addEventListener('click', () => {
    familyPhotos = [];
    uploadedPhotosList.innerHTML = ''; // 이전 목록 초기화
    let loadedPhotos = 0;
    let totalPhotosToLoad = 0;

    // 먼저 로드할 총 사진 수를 계산
    for (let i = 1; i <= 5; i++) {
        const photoInput = document.getElementById(`photo${i}`);
        const nameInput = document.getElementById(`name${i}`);
        if (photoInput.files && photoInput.files[0] && nameInput.value.trim() !== '') {
            totalPhotosToLoad++;
        }
    }

    if (totalPhotosToLoad === 0) {
        alert('최소 한 개의 사진과 이름을 입력해주세요.');
        return;
    }

    // 각 사진 로드
    for (let i = 1; i <= 5; i++) {
        const photoInput = document.getElementById(`photo${i}`);
        const nameInput = document.getElementById(`name${i}`);
        if (photoInput.files && photoInput.files[0] && nameInput.value.trim() !== '') {
            const reader = new FileReader();
            reader.onload = (e) => {
                familyPhotos.push({ src: e.target.result, name: nameInput.value });
                // 설정 화면에 업로드된 사진 목록 업데이트
                const photoItem = document.createElement('div');
                const img = document.createElement('img');
                img.src = e.target.result;
                const nameSpan = document.createElement('span');
                nameSpan.textContent = nameInput.value;
                photoItem.appendChild(img);
                photoItem.appendChild(nameSpan);
                uploadedPhotosList.appendChild(photoItem);
                
                loadedPhotos++;
                
                // 모든 사진이 로드되었을 때만 다음 화면으로 진행
                if (loadedPhotos === totalPhotosToLoad) {
                    uploadScreen.style.display = 'none';
                    gameStartScreen.style.display = 'block';
                    displayFamilyPhotosPreview();
                    selectRandomTarget();
                }
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    }
});

// 가족 사진 미리보기 표시
function displayFamilyPhotosPreview() {
    familyPhotosPreview.innerHTML = '';
    familyPhotos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.name;
        familyPhotosPreview.appendChild(img);
    });
}

// 찾을 대상 무작위 선정
function selectRandomTarget() {
    if (familyPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * familyPhotos.length);
        targetFamilyMember = familyPhotos[randomIndex];
        findTargetMessage.textContent = `${targetFamilyMember.name}님을 찾아보세요!`;
    }
}

// "게임 시작!" 버튼 클릭 시
startGameButton.addEventListener('click', () => {
    if (familyPhotos.length === 0) {
        alert('먼저 사진을 등록해주세요!');
        return;
    }
    gameStartScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    createTrainImages();
    revealedCount = 0;
});

// 기차 이미지 생성 및 이벤트 리스너 추가
function createTrainImages() {
    trainContainer.innerHTML = '';
    
    // 모든 기차 종류 포함
    const trains = [
        { id: 'hayabusa', name: '하야부사' },
        { id: 'komachi', name: '코마치' },
        { id: 'makukaje', name: '마쿠카제' },
        { id: 'tubame', name: '쓰바메' },
        { id: 'hakataka', name: '하카타카' },
        { id: 'hokuriku', name: '호쿠리쿠' }
    ];

    // 등록된 모든 사진을 포함하는 콘텐츠 배열 생성
    const contents = familyPhotos.map(photo => ({
        type: 'photo',
        content: photo
    }));

    // 남은 터널 자리에 랜덤한 기차 추가
    const remainingSlots = numberOfTunnels - contents.length;
    if (remainingSlots > 0) {
        shuffleArray(trains);
        const selectedTrains = trains.slice(0, remainingSlots);
        contents.push(...selectedTrains.map(train => ({
            type: 'train',
            content: train
        })));
    }

    // 최종 배열을 섞기
    shuffleArray(contents);

    // 터널 생성
    for (let i = 0; i < numberOfTunnels; i++) {
        const tunnelDiv = document.createElement('div');
        tunnelDiv.classList.add('tunnel');
        
        const innerContainer = document.createElement('div');
        innerContainer.classList.add('tunnel-inner');
        
        // 숨겨진 이미지 추가 (사진 또는 기차)
        const hiddenImg = document.createElement('img');
        const content = contents[i];
        
        if (content.type === 'photo') {
            hiddenImg.src = content.content.src;
            hiddenImg.alt = content.content.name;
            hiddenImg.classList.add('photo');
            tunnelDiv.dataset.contentType = 'photo';
            tunnelDiv.dataset.personName = content.content.name;
        } else {
            hiddenImg.src = `images/train/${content.content.id}.png`;
            hiddenImg.alt = content.content.name;
            hiddenImg.classList.add('train-image');
            tunnelDiv.dataset.contentType = 'train';
            tunnelDiv.dataset.trainId = content.content.id;
            tunnelDiv.dataset.trainName = content.content.name;
        }
        
        // 터널 이미지 추가
        const tunnelImg = document.createElement('img');
        tunnelImg.src = 'images/tunnel1.png';
        tunnelImg.alt = '터널';
        tunnelImg.classList.add('tunnel-image');
        
        // 클릭 이벤트 추가
        tunnelDiv.addEventListener('click', () => {
            if (!tunnelDiv.classList.contains('revealed')) {
                tunnelDiv.classList.add('revealed');
                revealedCount++;

                if (tunnelDiv.dataset.contentType === 'photo' && 
                    tunnelDiv.dataset.personName === targetFamilyMember.name) {
                    tunnelDiv.classList.add('correct');
                } else {
                    tunnelDiv.classList.add('wrong');
                }

                if (revealedCount === numberOfTunnels) {
                    setTimeout(() => {
                        gameScreen.style.display = 'none';
                        gameOverScreen.style.display = 'block';
                        finalTargetPhoto.textContent = targetFamilyMember.name;
                        congratulationsMessage.textContent = `${targetFamilyMember.name}님을 찾았어요! 🎉`;
                    }, 1000);
                }
            }
        });
        
        // 이미지들을 컨테이너에 추가
        innerContainer.appendChild(hiddenImg);
        innerContainer.appendChild(tunnelImg);
        tunnelDiv.appendChild(innerContainer);
        trainContainer.appendChild(tunnelDiv);
    }

    // 찾을 대상 메시지 업데이트
    findTargetMessage.textContent = `${targetFamilyMember.name}님을 찾아보세요!`;
}

// "다시 하기" 버튼 클릭 시
replayButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameStartScreen.style.display = 'block';
    createTrainImages(); // 게임 화면 다시 생성
    selectRandomTarget();
    revealedCount = 0;
});

// 언어 설정 변경 (아직 기능 없음)
languageSelect.addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    console.log(`언어 설정: ${selectedLanguage}`);
    // 여기에 언어 변경에 따른 텍스트 업데이트 로직 추가 (추후 구현)
});

// 설정 화면으로 이동 (현재 설정 화면 내용은 임시)
const goToSettingsButtonIntro = document.createElement('button');
goToSettingsButtonIntro.textContent = '설정';
goToSettingsButtonIntro.addEventListener('click', () => {
    introScreen.style.display = 'none';
    settingsScreen.style.display = 'block';
});
introScreen.appendChild(goToSettingsButtonIntro);

goToIntroButtonSettings.addEventListener('click', () => {
    settingsScreen.style.display = 'none';
    introScreen.style.display = 'block';
    // trainSound.play(); // 효과음
});