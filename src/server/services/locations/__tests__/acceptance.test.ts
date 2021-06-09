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
import faker from "faker";
import errorHandler from "../../../internal/middleware/error-handler";
import { Location, LocationCreate, LocationUpdate } from "../entity";
import { LocationRepository } from "../repository";
import location from "../index";

let locations: Location[] = [
  {
    entityId: 1,
    locationName: "indonesia test",
    countryCode: "62",
    dataCenter: "aws",
    createdAt: 1640908800,
    updatedAt: 1640908800,
    createdBy: faker.internet.exampleEmail(),
    updatedBy: faker.internet.exampleEmail(),
  },
];

describe("Location Service", () => {
  // arrange
  const app = express();
  app.use(express.json());
  app.use(location);
  app.use(errorHandler());

  beforeEach(function () {
    jest.mock("../repository");

    LocationRepository.prototype.findMany = async () => {
      return locations;
    };

    LocationRepository.prototype.findById = async (id: number) => {
      return locations.find(locations => locations.entityId == id) || null;
    };

    LocationRepository.prototype.create = async (input: LocationCreate) => {
      const createdLocation = { entityId: 2, ...input };
      locations.push(createdLocation);

      return createdLocation;
    };

    LocationRepository.prototype.update = async (input: LocationUpdate) => {
      const { entityId, ...newData } = input;
      locations = locations.map(location => {
        if (location.entityId == entityId) {
          return { ...location, newData };
        }

        return location;
      });

      const updatedLocation = locations.find(
        location => location.entityId === entityId,
      );
      if (!updatedLocation) {
        throw new Error("Location not found");
      }

      return updatedLocation;
    };

    LocationRepository.prototype.delete = async (id: number) => {
      locations = locations.filter(location => location.entityId !== id);
      return id;
    };
  });

  describe("GET /v1/locations", () => {
    it("should return success 200", async done => {
      const res = await request(app).get("/v1/locations");

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      done();
    });

    it("should return success 200", async done => {
      const res = await request(app).get("/v1/locations?offset=0&size=1");

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      LocationRepository.prototype.findMany = async (): Promise<Location[]> => {
        throw new Error("query error");
      };

      // act
      const res = await request(app).get("/v1/locations");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("GET /v1/locations/:id", () => {
    it("should return success 200", async done => {
      const res = await request(app).get("/v1/locations/1");

      expect(res.status).toBe(200);
      expect(res.body.data.entityId).toBe(1);
      done();
    });

    it("should return http status code 404", async done => {
      // act
      const res = await request(app).get("/v1/locations/2");

      // assert
      expect(res.status).toBe(404);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      LocationRepository.prototype.findById = async (): Promise<Location> => {
        throw new Error("query error");
      };

      // act
      const res = await request(app).get("/v1/locations/1");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("POST /v1/location", () => {
    it("should return success 201", async done => {
      const res = await request(app).post("/v1/location").send({
        locationName: "Indonesia",
        countryCode: "62",
        dataCenter: "alibaba",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.entityId).toBe(2);
      done();
    });

    it("should return http status code 400", async done => {
      // act
      const res = await request(app).post("/v1/location").send({
        locationName: "Indonesia",
        countryCode: "62",
      });

      // assert
      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      LocationRepository.prototype.create = async (data: LocationCreate) => {
        throw new Error(`query error with data center: ${data.dataCenter}`);
      };

      // act
      const res = await request(app).post("/v1/location").send({
        locationName: "Indonesia",
        countryCode: "62",
        dataCenter: "alibaba",
      });

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("PUT /v1/locations/:id", () => {
    it("should return success 201", async done => {
      const res = await request(app).put("/v1/locations/2").send({
        locationName: "location update",
        countryCode: "62",
        dataCenter: "aws",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.entityId).toBe(2);
      done();
    });

    it("should return http status code 400", async done => {
      // act
      const res = await request(app).put("/v1/locations/2").send({
        entityId: 2,
        locationName: "location update",
        countryCode: "62",
        dataCenter: "aws",
      });

      // assert
      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      LocationRepository.prototype.update = async (data: LocationUpdate) => {
        throw new Error(`query error entity id: ${data.entityId}`);
      };

      // act
      const res = await request(app).put("/v1/locations/2").send({
        locationName: "location update",
        countryCode: "62",
        dataCenter: "aws",
      });

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });

  describe("DELETE /v1/locations", () => {
    it("should return success 200", async done => {
      const res = await request(app).delete("/v1/locations/2");

      expect(res.status).toBe(200);
      done();
    });

    it("should return http status code 422", async done => {
      // arrange
      LocationRepository.prototype.delete = async (id: number) => {
        throw new Error(`query error id: ${id}`);
      };

      // act
      const res = await request(app).delete("/v1/locations/3");

      // assert
      expect(res.status).toBe(422);
      done();
    });
  });
});
