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

import express, { Request, Response, NextFunction } from "express";
import Joi from "joi";
import faker from "faker";
import request from "supertest";
import { AppError } from "../../app-error";
import validate from "../validator";

describe("Validator middleware", () => {
  const schema = Joi.object().keys({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });

  it("should return http status 200", async () => {
    // arrange
    const app = express();

    app.use(express.json());
    app.get("/v1/users", validate(schema), (_, res) => {
      res.sendStatus(200);
    });

    // act
    const res = await request(app).get("/v1/users").send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    // assert
    expect(res.status).toBe(200);
  });

  it("should return http status 400", async () => {
    // arrange
    const app = express();

    app.use(express.json());
    app.get("/v1/users", validate(schema), (_, res) => {
      res.sendStatus(200);
    });
    app.use((err: AppError, _: Request, res: Response, next: NextFunction) => {
      if (err) {
        res.status(err.httpErrorCode).send({
          message: err.message,
        });
      }
      next();
    });

    // act
    const res = await request(app).get("/v1/users").send({
      email: faker.internet.email(),
    });

    // assert
    expect(res.status).toBe(400);
  });
});
