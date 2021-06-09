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
import request from "supertest";
import errorHandler from "../../../internal/middleware/error-handler";
import { Config } from "../entity";
import { ConfigRepository } from "../repository";
import config from "../index";

let configs: Config[] = [
  {
    key: "DB_NAME",
    value: "indonesia test",
  },
];

describe("Location Service", () => {
  // arrange
  const app = express();
  app.use(express.json());
  app.use(config);
  app.use(errorHandler());

  beforeEach(function () {
    jest.mock("../repository");

    ConfigRepository.prototype.findMany = async () => {
      return configs;
    };

    ConfigRepository.prototype.findById = async (key: string) => {
      return configs.find(config => config.key == key) || null;
    };

    ConfigRepository.prototype.create = async (input: Config) => {
      const createdConfig = { key: input.key, value: input.value };
      configs.push(createdConfig);

      return createdConfig;
    };

    ConfigRepository.prototype.update = async (input: Config) => {
      const { key, ...newData } = input;
      configs = configs.map(config => {
        if (config.key == key) {
          return { ...config, newData };
        }

        return config;
      });

      const updatedConfig = configs.find(config => config.key === key);
      if (!updatedConfig) {
        throw new Error("Location not found");
      }

      return updatedConfig;
    };

    ConfigRepository.prototype.delete = async (key: string) => {
      configs = configs.filter(config => config.key !== key);
      return key;
    };
  });

  describe("GET /v1/configs", () => {
    it("should return success 200", async done => {
      const res = await request(app).get("/v1/configs");

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      done();
    });

    it("should return success 200", async done => {
      const res = await request(app).get("/v1/configs?offset=0&size=1");

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      ConfigRepository.prototype.findMany = async (): Promise<Config[]> => {
        throw new Error("query error");
      };

      // act
      const res = await request(app).get("/v1/configs");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("GET /v1/configs/:id", () => {
    it("should return success 200", async done => {
      const res = await request(app).get("/v1/configs/DB_NAME");

      expect(res.status).toBe(200);
      expect(res.body.data.key).toBe("DB_NAME");
      done();
    });

    it("should return http status code 404", async done => {
      // act
      const res = await request(app).get("/v1/configs/DB_NO");

      // assert
      expect(res.status).toBe(404);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      ConfigRepository.prototype.findById = async (): Promise<Config> => {
        throw new Error("query error");
      };

      // act
      const res = await request(app).get("/v1/configs/DB_HOST");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("POST /v1/config", () => {
    it("should return success 201", async done => {
      const res = await request(app).post("/v1/configs").send({
        key: "DB_HOST",
        value: "localhost",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.key).toBe("DB_HOST");
      done();
    });

    it("should return http status code 400", async done => {
      // act
      const res = await request(app).post("/v1/configs").send({
        key: "DB_USER",
      });

      // assert
      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      ConfigRepository.prototype.create = async (data: Config) => {
        throw new Error(`query error with key: ${data.key}`);
      };

      // act
      const res = await request(app).post("/v1/configs").send({
        key: "DB_PASSWORD",
        value: "12345678",
      });

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("PUT /v1/configs/:id", () => {
    it("should return success 201", async done => {
      const res = await request(app).put("/v1/configs/DB_NAME").send({
        value: "http://12.122.120.23",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.key).toBe("DB_NAME");
      done();
    });

    it("should return http status code 400", async done => {
      // act
      const res = await request(app).put("/v1/configs/DB_NO").send({
        key: "DB_NO",
        value: "123",
      });

      // assert
      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      ConfigRepository.prototype.update = async (data: Config) => {
        throw new Error(`query error key: ${data.key}`);
      };

      // act
      const res = await request(app).put("/v1/configs/DB_NAME").send({
        value: "testing DB",
      });

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("DELETE /v1/configs", () => {
    it("should return success 200", async done => {
      const res = await request(app).delete("/v1/configs/2");

      expect(res.status).toBe(200);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      ConfigRepository.prototype.delete = async (key: string) => {
        throw new Error(`query error key: ${key}`);
      };

      // act
      const res = await request(app).delete("/v1/configs/POOL_SIZE");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });
});
