import logger from "./utils/logger";
import server from "./server";
import wss from "./server/websocket";

import { mapSize } from "../config.json";
import GameRoom from "./game/GameRoom";

const room = new GameRoom(mapSize.x, mapSize.y);
const mesa = wss(server);

mesa.on("connection", client => {
  room.emit("connection", client);
});

const port = process.env.PORT || 8080;
server.listen(port, () => logger.info("Server running at port", port));
