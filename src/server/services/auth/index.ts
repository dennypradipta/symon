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
import validate from "../../internal/middleware/validator";
import { createSchemaValidator } from "../users/validator";
import { login, refresh, checkHasUser, createFirstUser } from "./controller";
import {
  loginRequesBodytValidator,
  refreshRequestBodyValidator,
} from "./validator";

const router = express.Router();

router.get("/v1/auth/check-users", checkHasUser);
router.post("/v1/auth", validate(loginRequesBodytValidator), login);
router.post("/v1/auth/user", validate(createSchemaValidator), createFirstUser);
router.post("/v1/refresh", validate(refreshRequestBodyValidator), refresh);

export default router;
