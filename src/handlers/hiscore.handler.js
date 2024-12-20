export const highScoreHandler = (userId, payload) => {
    const { score, previousHighScore } = payload;

    // 검증: 이전 최고 점수보다 높은지 확인
    if (score > previousHighScore) {
        return {
            status: 'success',
            newHighScore: score  // 이 값이 broadcast 됨
        };
    }

    return {
        status: 'success'
    };
};