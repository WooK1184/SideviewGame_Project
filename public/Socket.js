import { CLIENT_VERSION } from './Constants.js';

const USER_ID_KEY = 'userId';
const USER_CREATED_KEY = 'userCreatedAt';
const HIGH_SCORE_KEY = 'highScore';

const socket = io('http://localhost:3000', {
    query: {
        clientVersion: CLIENT_VERSION,
    },
});

// 유저 ID 체크 및 초기화
const checkAndInitUser = () => {
    const userId = localStorage.getItem(USER_ID_KEY);
    const createdAt = localStorage.getItem(USER_CREATED_KEY);
    const highScore = localStorage.getItem(HIGH_SCORE_KEY);

    // 최고점수 보유자이거나 1일이 지나지 않은 유저는 유지
    if (userId && (isHighScoreHolder(userId, highScore) || !isExpired(createdAt))) {
        return userId;
    }

    // 그 외의 경우 유저 정보 삭제
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_CREATED_KEY);
    return null;
};

const isExpired = (createdAt) => {
    if (!createdAt) return true;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - Number(createdAt) > oneDayInMs;
};

const isHighScoreHolder = (userId, highScore) => {
    return highScore && userId; // 최고점수가 있고 해당 유저의 것인 경우
};

let userId = checkAndInitUser();

socket.on('response', (data) => {
    // 최고점수 갱신 broadcast 수신
    if (data.type === 'highscore_update') {
        // 최고점수 보유자인 경우
        if (data.userId === userId) {
            console.log('최고기록 보유중입니다!');
            console.log(`게임 접속 링크: http://localhost:3000/${userId}`);
        }
    }
});

socket.on('response', (data) => {
    console.log(data);
});

socket.on('connection', (data) => {
    console.log('connection: ', data);
    if (!userId) {
        // 새로운 유저 정보 저장
        userId = data.uuid;
        localStorage.setItem(USER_ID_KEY, userId);
        localStorage.setItem(USER_CREATED_KEY, Date.now().toString());
    }
});

const sendEvent = (handlerId, payload) => {
    socket.emit('event', {
        userId,
        clientVersion: CLIENT_VERSION,
        handlerId,
        payload,
    });
};

export { sendEvent, socket };
