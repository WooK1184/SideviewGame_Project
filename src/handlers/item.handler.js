import { getGameAssets } from "../init/assets.js";
import { getStage } from "../models/stage.model.js";

export const itemHandler = (userId, payload) => {
    const { items, itemUnlocks } = getGameAssets();
    
    console.log('=== Item Handler Debug ===');
    console.log('Received payload:', payload);
    console.log('Current itemUnlocks data:', itemUnlocks);
    
    // 1. 현재 스테이지 확인
    let currentStages = getStage(userId);
    if (!currentStages.length) {
        console.log('No stages found for user:', userId);
        return { status: 'fail', message: "No stages found for User" }
    }
    const currentStageId = currentStages[currentStages.length - 1].id;
    console.log('Current Stage ID:', currentStageId);

    // 2. 현재 스테이지에서 획득 가능한 아이템 목록 확인
    const availableUnlocks = itemUnlocks.data.filter(unlock => unlock.stage_id <= currentStageId);
    console.log('Available unlocks:', availableUnlocks);
    
    if (!availableUnlocks.length) {
        console.log('No available unlocks found for stage:', currentStageId);
        return { status: 'fail', message: "No items available for current stage" };
    }

    // 사용 가능한 모든 아이템 ID 수집
    const availableItemIds = new Set();
    availableUnlocks.forEach(unlock => {
        const ids = Array.isArray(unlock.item_ids) ? unlock.item_ids : [unlock.item_ids];
        ids.forEach(id => availableItemIds.add(id));
    });
    console.log('Available item IDs:', Array.from(availableItemIds));

    // 3. 획득한 아이템이 현재 스테이지에서 획득 가능한지 확인
    if (!availableItemIds.has(payload.itemId)) {
        console.log('Item not available:', payload.itemId);
        return { status: 'fail', message: "Item not available in current stage" };
    }

    // 4. 아이템 점수 계산
    const item = items.data.find(item => item.id === payload.itemId);
    if (!item) {
        console.log('Invalid item ID:', payload.itemId);
        return { status: 'fail', message: "Invalid item" };
    }

    console.log('Success! Item found:', item);
    return {
        status: 'success',
        score: item.score,
        itemId: payload.itemId,
        stageItems: itemUnlocks
    };
};