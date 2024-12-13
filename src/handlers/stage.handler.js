import { getGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js"

export const movesStageHandler = (userId, payload) => {

    let currentStages = getStage(userId);
    if (!currentStages.length) {
        return { status: 'fail', message: "No stages found for User" }
    }

    //오름차순 -> 가장 큰 스테이지 ID를 확인
    currentStages.sort((a, b) => a.id - b.id);
    const currentStage = currentStages[currentStages.length - 1];
    
    if (currentStage.id !== payload.currentStage) {
        return { status: 'fail', message: 'Current Stage missmatch' }
    }

    //점수 검증
    const serverTime = Data.now();
    const elapsedTime = (serverTime - currentStage.timestamp) / 1000;

    //1스테이지에서 2스테이지 넘어가는 과정
    //5는 임의로 넣은 오차범위
    if (elapsedTime < 100 || elapsedTime > 105) {
        return { status: 'fail' }
    }

    const { stages } = getGameAssets();
    if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
        return { status: 'fail', message: 'Target Stage missmatch' };
    }

    setStage(userId, payload.targetStage);
    return { status: 'success' };
};