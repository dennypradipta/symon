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
import faker from "faker";
import request from "supertest";

import errorHandler from "../../../internal/middleware/error-handler";
import { Project, ProjectCreate, ProjectUpdate } from "../entity";
import project from "../index";
import { ProjectRepository } from "../repository";

let projects: Project[] = [
  {
    id: 1,
    name: faker.company.companyName(),
    organization_id: faker.random.number(),
  },
];

describe("Project Service", () => {
  const app = express();

  app.use(express.json());
  app.use(project);
  app.use(errorHandler());

  beforeEach(function () {
    jest.mock("../repository");

    ProjectRepository.prototype.findMany = async () => {
      return projects;
    };

    ProjectRepository.prototype.findOneByID = async (id: number) => {
      return projects.find(project => project.id === id) || null;
    };

    ProjectRepository.prototype.create = async (
      projectCreate: ProjectCreate,
    ) => {
      const createdProject = { id: 2, ...projectCreate };
      projects.push(createdProject);

      return createdProject;
    };

    ProjectRepository.prototype.update = async (
      id: number,
      projectUpdate: ProjectUpdate,
    ) => {
      projects = projects.map(project => {
        if (project.id === id) {
          return { ...project, projectUpdate };
        }

        return project;
      });

      const updatedData = projects.find(project => project.id === id);

      if (!updatedData) {
        throw new Error("Project not found");
      }

      return updatedData;
    };

    ProjectRepository.prototype.destroy = async (id: number) => {
      projects = projects.filter(project => project.id !== id);

      return id;
    };
  });

  describe("GET /v1/projects", () => {
    it("should return http status code 200", async done => {
      const res = await request(app).get("/v1/projects");

      expect(res.status).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        result: "SUCCESS",
        message: "Successfully get list of projects",
        data: projects,
      });

      done();
    });

    it("should return http status code 422", async done => {
      ProjectRepository.prototype.findMany = async (): Promise<Project[]> => {
        throw new Error("query error");
      };

      const res = await request(app).get("/v1/projects");

      expect(res.status).toBe(422);
      done();
    });
  });

  describe("GET /v1/projects/:id", () => {
    it("should return http status code 200", async done => {
      const res = await request(app).get("/v1/projects/1");

      expect(res.status).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        result: "SUCCESS",
        message: "Successfully get project",
        data: projects[0],
      });

      done();
    });

    it("should return http status code 404", async done => {
      const res = await request(app).get("/v1/projects/2");

      expect(res.status).toBe(404);
      done();
    });

    it("should return http status code 422", async done => {
      ProjectRepository.prototype.findOneByID = async (id: number) => {
        throw new Error(`query error id: ${id}`);
      };

      const res = await request(app).get("/v1/projects/3");

      expect(res.status).toBe(422);
      done();
    });
  });

  describe("POST /v1/projects", () => {
    const mockData = {
      name: faker.company.companyName(),
      organization_id: faker.random.number(),
    };

    it("should return http status code 201", async done => {
      const res = await request(app).post("/v1/projects").send(mockData);

      expect(res.status).toStrictEqual(201);
      expect(res.body).toStrictEqual({
        result: "SUCCESS",
        message: "Successfully create project",
        data: {
          ...mockData,
          id: 2,
        },
      });

      done();
    });

    it("should return http status code 400", async done => {
      const res = await request(app).post("/v1/projects").send({});

      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      ProjectRepository.prototype.create = async (data: ProjectCreate) => {
        throw new Error(`query error with name: ${data.name}`);
      };

      const res = await request(app).post("/v1/projects").send({
        name: faker.company.companyName(),
        organization_id: faker.random.number(),
      });

      expect(res.status).toBe(422);
      done();
    });
  });

  describe("PUT /v1/projects/:id", () => {
    it("should return http status code 200", async done => {
      const res = await request(app).put("/v1/projects/2").send({
        name: faker.company.companyName(),
      });

      expect(res.status).toBe(200);
      expect(projects.length).toBe(2);
      done();
    });

    it("should return http status code 400", async done => {
      const res = await request(app).put("/v1/projects/2").send({
        id: 2,
        name: faker.company.companyName(),
      });

      expect(res.status).toBe(400);
      done();
    });

    it("should return http status code 422", async done => {
      ProjectRepository.prototype.update = async (id: number) => {
        throw new Error(`query error id: ${id}`);
      };

      const res = await request(app).put("/v1/projects/2").send({
        name: faker.company.companyName(),
      });

      expect(res.status).toBe(422);
      done();
    });
  });

  describe("DELETE /v1/projects/:id", () => {
    it("should return http status code 200", async done => {
      const res = await request(app).delete("/v1/projects/2");

      expect(res.status).toStrictEqual(200);
      expect(res.body).toStrictEqual({
        result: "SUCCESS",
        message: "Successfully delete project",
      });

      done();
    });

    it("should return http status code 422", async done => {
      ProjectRepository.prototype.destroy = async (id: number) => {
        throw new Error(`query error id: ${id}`);
      };

      const res = await request(app).delete("/v1/projects/3");

      expect(res.status).toBe(422);
      done();
    });
  });
});
