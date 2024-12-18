import { gameEnd, gameStart } from "./game.handler.js";
import { itemHandler } from "./item.handler.js";
import { movesStageHandler } from "./stage.handler.js";

const handlerMappings = {
    2: gameStart,
    3: gameEnd,
    11: movesStageHandler,
    12: itemHandler
};

export default handlerMappings