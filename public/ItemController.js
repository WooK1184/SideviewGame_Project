import Item from "./Item.js";

class ItemController {
    INTERVAL_MIN = 0;
    INTERVAL_MAX = 12000;

    nextInterval = null;
    items = [];
    currentStage = 1000;
    stageItemUnlocks = null;  // 스테이지별 아이템 데이터

    constructor(ctx, itemImages, scaleRatio, speed) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.itemImages = itemImages;
        this.scaleRatio = scaleRatio;
        this.speed = speed;
        this.setNextItemTime();
    }

    setStageItems(stageItemUnlocks) {
        this.stageItemUnlocks = stageItemUnlocks;
        console.log('Stage items set:', this.stageItemUnlocks);
    }

    setStage(stageId) {
        this.currentStage = stageId;
        console.log('Stage changed to:', this.currentStage);
    }

    setNextItemTime() {
        this.nextInterval = this.getRandomNumber(
            this.INTERVAL_MIN,
            this.INTERVAL_MAX
        );
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createItem() {
        if (!this.stageItemUnlocks || !this.stageItemUnlocks.data) {
            console.log('No stageItems data available');
            return;
        }

        // 현재 스테이지의 아이템 정보 찾기
        const stageInfo = this.stageItemUnlocks.data.find(
            stage => stage.stage_id === this.currentStage
        );

        console.log('Creating item for stage:', this.currentStage);
        console.log('Stage info found:', stageInfo);

        if (!stageInfo) {
            console.log('No stage info found for stage:', this.currentStage);
            return;
        }

        // 현재 스테이지에서 사용 가능한 아이템 ID 목록
        const availableItemIds = Array.isArray(stageInfo.item_ids) 
            ? stageInfo.item_ids 
            : [stageInfo.item_ids];

        console.log('Available item IDs:', availableItemIds);

        // 사용 가능한 아이템 이미지만 필터링
        const availableImages = this.itemImages.filter(img => 
            availableItemIds.includes(img.id)
        );

        if (availableImages.length === 0) {
            console.log('No available images found for current stage');
            return;
        }

        const index = this.getRandomNumber(0, availableImages.length - 1);
        const itemInfo = availableImages[index];
        
        const x = this.canvas.width * 1.5;
        const y = this.getRandomNumber(
            10,
            this.canvas.height - itemInfo.height
        );

        const item = new Item(
            this.ctx,
            itemInfo.id,
            x,
            y,
            itemInfo.width,
            itemInfo.height,
            itemInfo.image
        );

        this.items.push(item);
    }

    update(gameSpeed, deltaTime) {
        if(this.nextInterval <= 0) {
            this.createItem();
            this.setNextItemTime();
        }

        this.nextInterval -= deltaTime;

        this.items.forEach((item) => {
            item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
        });

        this.items = this.items.filter(item => item.width > 0);
    }

    draw() {
        this.items.forEach((item) => item.draw());
    }

    collideWith(sprite) {
        const collidedItem = this.items.find(item => item.collideWith(sprite))
        if (collidedItem) {
            return {
                itemId: collidedItem.id
            }
        }
    }

    reset() {
        this.items = [];
        this.currentStage = 1000;
    }
}

export default ItemController;