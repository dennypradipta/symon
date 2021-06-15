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

import { generatePrismaArguments } from "../query-helper";

describe("Query helper", () => {
  describe("should generate default arguments", () => {
    it("with no arguments", async () => {
      // arrange
      const expectedResult = { take: 10 };

      // act
      const prismaArguments = generatePrismaArguments({});

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });
  });

  it("should generate arguments with fields", async () => {
    // arrange
    const expectedResult = {
      select: {
        firstName: true,
        age: true,
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        fields: "firstName,age",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  it("should generate arguments with filter", async () => {
    // arrange
    const expectedResult = {
      where: {
        AND: [
          {
            firstName: {
              equals: "john",
            },
          },
          {
            age: {
              gte: 21,
            },
          },
        ],
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        filter: "firstName equals john and age gte 21",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  describe("should generate filter arguments with certain types", () => {
    it("such as null and undefined values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              flag: {
                equals: null,
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "flag equals null",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });
    it("such as boolean values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              true: {
                equals: true,
              },
            },
            {
              false: {
                equals: false,
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "true equals true and false equals false",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });

    it("such as number values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              count: {
                equals: 123,
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "count equals 123",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });

    it("such as string values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              name: {
                equals: "symon",
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "name equals symon",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });

    it("such as UUID values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              uuid: {
                equals: "11f12dd6-b63e-425f-b11f-5a996b5866cf",
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "uuid equals 11f12dd6-b63e-425f-b11f-5a996b5866cf",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });

    it("such as string but contain boolean values", async () => {
      // arrange
      const expectedResult = {
        where: {
          AND: [
            {
              name: {
                equals: "truedy",
              },
            },
          ],
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          filter: "name equals truedy",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });
  });

  it("should generate arguments with nested object filter", async () => {
    // arrange
    const expectedResult = {
      where: {
        AND: [
          {
            name: {
              first: {
                equals: "john",
              },
            },
          },
        ],
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        filter: "name[first] equals john",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  it("should generate arguments with search", async () => {
    // arrange
    const expectedResult = {
      where: {
        AND: [
          {
            firstName: {
              contains: "john",
            },
          },
          {
            lastName: {
              contains: "john",
            },
          },
        ],
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      searchableFields: ["firstName", "lastName"],
      queryArgs: {
        search: "john",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  it("should generate arguments with empty searchable field", async () => {
    // arrange
    const expectedResult = {
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        search: "john",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  it("should generate arguments with filter and search", async () => {
    // arrange
    const expectedResult = {
      where: {
        AND: [
          {
            address: {
              equals: "Jakarta, Indonesia",
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
          {
            firstName: {
              contains: "doe",
            },
          },
          {
            lastName: {
              contains: "doe",
            },
          },
        ],
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      searchableFields: ["firstName", "lastName"],
      queryArgs: {
        filter: "address equals Jakarta, Indonesia and isActive equals true",
        search: "doe",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  describe("should generate arguments with limit", () => {
    it("limit can parse to integer", async () => {
      // arrange
      const expectedResult = {
        take: 30,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          limit: "30",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });

    it("limit cannot parse to integer", async () => {
      // arrange
      const expectedResult = {
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          limit: "example",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });
  });

  it("should generate arguments with cursor", async () => {
    // arrange
    const expectedResult = {
      skip: 1,
      cursor: {
        id: 5,
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        cursor: "5",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });

  describe("should generate arguments by requested sort", () => {
    it("without order", async () => {
      // arrange
      const expectedResult = {
        orderBy: {
          firstName: "asc",
        },
        take: 10,
      };

      // act
      const prismaArguments = generatePrismaArguments({
        queryArgs: {
          sort: "firstName",
        },
      });

      // assert
      expect(prismaArguments).toStrictEqual(expectedResult);
    });
  });

  it("with desc order", async () => {
    // arrange
    const expectedResult = {
      orderBy: {
        firstName: "desc",
      },
      take: 10,
    };

    // act
    const prismaArguments = generatePrismaArguments({
      queryArgs: {
        sort: "firstName desc",
      },
    });

    // assert
    expect(prismaArguments).toStrictEqual(expectedResult);
  });
});
