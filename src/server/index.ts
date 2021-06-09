/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  SYMON Contributors                                      *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

import { cfg } from "../config";
import * as http from "http";

import { requestLogger, logger } from "./internal/logger";
import errorHandler from "./internal/middleware/error-handler";
import notFound from "./internal/middleware/not-found";
import router from "./router";

const app: express.Application = express();
const port = cfg.port || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);

app.use(errorHandler());
app.use(notFound());

let server: http.Server;
(async () => {
  server = app.listen(port, () => {
    logger.info(`  Listening on port ${port} in ${cfg.env} mode`);
    logger.info("  Press CTRL-C to stop\n");
  });
})();

const stopServer = async () => {
  logger.info("  Shutting down the server . . .");
  if (server.listening) {
    logger.close();
    server.close();
  }
};

// gracefully shutdown system if these processes is occured
process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
