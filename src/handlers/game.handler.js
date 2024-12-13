import { getGameAssets } from "../init/assets.js";
import { clearStage, getStage, setStage } from "../models/stage.model.js";

export const gameStart = (uuid, payload) => {
    
    const { stages } = getGameAssets();

    clearStage(uuid);

    setStage(uuid, stages.data[0].id, payload.timestamp);
    console.log('Stage: ', getStage(uuid));

    return { status: 'success' };
}

export const gameEnd = () => {
    //클라이언트는 게임 종료시 타임스탬프와 총 점수
    const { timestamp: gameEndTime, score } = payload;
    const stages = getStage(uuid);

    if (!stages.length) {
        return { status: 'fail', message: 'No stages found for User' };
    }

    let totalScore = 0;

    stages.forEach((stage, index) => {
        let stageEndTime;
        if (index === stages.length - 1) {
            stageEndTime = gameEndTime;
        } else {
            stageEndTime = stages[index + 1].timestamp;
        }

        const stageDuration = (stageEndTime - stage.timestamp) / 1000;
        totalScore += stageDuration; //1초당 1점
    })

    //점수와 타임스탬프 검증
    //오차범위 5
    if (Math.abs(score - totalScore) > 5) {
        return { status: 'fail', message: 'Score verification failed' };
    }

    return { status: 'success', message: 'Game End', score };
};