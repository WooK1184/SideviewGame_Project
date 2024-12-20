import { sendEvent, socket } from "./Socket.js";

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  currentStage = 1000;
  scorePerSecond = 1;
  stageChangeInProgress = false;
  stages = [];

  constructor(ctx, scaleRatio, itemController) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.itemController = itemController;
    this.initializeSocket();
  }

  initializeSocket() {
    socket.on('response', (data) => {
      console.log('Received response:', data);
      
      if (data.status === 'success') {
        if (data.stageData) {
          this.stages = data.stageData;
          console.log('Received stage data:', this.stages);
        }
        
        if (data.stageItems) {
          this.itemController.setStageItems(data.stageItems);
        }
        
        if (data.stage) {
          const prevStage = this.currentStage;
          this.currentStage = data.stage.id;
          this.scorePerSecond = Number(data.stage.scorePerSecond);
          this.stageChangeInProgress = false;
          
          this.itemController.setStage(this.currentStage);
          
          console.log('=== Stage Change ===');
          console.log(`Previous Stage: ${prevStage}`);
          console.log(`New Stage: ${this.currentStage}`);
          console.log(`New Score Per Second: ${this.scorePerSecond}`);
          console.log('==================');
        }

        if (data.score && data.itemId) {
          this.score += data.score;
          console.log(`아이템 획득! ID: ${data.itemId}, 점수: +${data.score}`);
        }
      } else if (data.status === 'fail') {
        this.stageChangeInProgress = false;
      }
    });
  }

  update(deltaTime) {
    this.score += (deltaTime * 0.001) * this.scorePerSecond;
    const currentScore = Math.floor(this.score);
    
    if (!this.stageChangeInProgress && this.stages.length > 0) {
      const nextStage = this.stages.find((stage, index) => {
        const nextStageScore = this.stages[index + 1]?.score || Infinity;
        return currentScore >= stage.score && currentScore < nextStageScore;
      });

      if (nextStage && 
          nextStage.id !== this.currentStage && 
          nextStage.id <= this.stages[this.stages.length - 1].id) {
        this.stageChangeInProgress = true;
        sendEvent(11, { 
          currentStage: this.currentStage,
          targetStage: nextStage.id,
          score: currentScore
        });
      }
    }
  }

  reset() {
    this.score = 0;
    this.currentStage = 1000;
    this.scorePerSecond = 1;
    this.stageChangeInProgress = false;
  }


  getItem(itemId) {
    if (!this.stageChangeInProgress) {
        sendEvent(12, { 
            itemId: itemId
        });
    }
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
