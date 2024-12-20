import { getGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js"

export const movesStageHandler = (userId, payload) => {
    const { stages, itemUnlocks } = getGameAssets();
    
    // 1. 현재 스테이지 정보 확인
    let currentStages = getStage(userId);
    if (!currentStages.length) {
        return { status: 'fail', message: "No stages found for User" }
    }

    // 2. 현재 스테이지와 목표 스테이지 데이터 검증
    const currentStageData = stages.data.find(stage => stage.id === payload.currentStage);
    const targetStageData = stages.data.find(stage => stage.id === payload.targetStage);

    if (!currentStageData || !targetStageData) {
        return { status: 'fail', message: 'Invalid stage data' };
    }

    // 3. 스테이지 순서 검증 (건너뛰기 방지)
    if (targetStageData.id !== currentStageData.id + 1) {
        return { status: 'fail', message: 'Invalid stage sequence' };
    }

    // 4. 점수 검증
    if (payload.score < targetStageData.score) {
        return { status: 'fail', message: 'Insufficient score for stage transition' };
    }

    // 5. 시간 기반 검증 (아이템 점수 제외)
    const currentTime = Date.now();
    const lastStageTime = currentStages[currentStages.length - 1].timestamp;
    const timeDiff = (currentTime - lastStageTime) / 1000; // 초 단위

    // 기본 점수만으로 필요한 시간 계산
    const baseScorePerSecond = currentStageData.scorePerSecond;
    const baseScoreDiff = targetStageData.score - currentStageData.score;
    const minRequiredTime = baseScoreDiff / baseScorePerSecond;

    // 허용 오차 범위 (5초)를 더 넓게 설정 (예: 10초)
    if (timeDiff < minRequiredTime - 10) {
        console.log('Time validation:', {
            timeDiff,
            minRequiredTime,
            baseScoreDiff,
            baseScorePerSecond
        });
        return { status: 'fail', message: 'Invalid stage transition time' };
    }

    // 검증 통과 후 새로운 스테이지 설정
    setStage(userId, targetStageData.id, currentTime);

    return { 
        status: 'success',
        stage: {
            id: targetStageData.id,
            scorePerSecond: targetStageData.scorePerSecond
        },
        stageItems: itemUnlocks
    };
};