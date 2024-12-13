import { gameEnd, gameStart } from "./game.handler.js";
import { movesStageHandler } from "./stage.handler.js";

const handlerMappings = {
    2: gameStart,
    3: gameEnd,
    11: movesStageHandler,
};

export default handlerMappings