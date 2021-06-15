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

import { Prisma } from ".prisma/client";

type query = {
  fields?: string;
  filter?: string;
  limit?: string;
  cursor?: string;
  search?: string;
  sort?: string;
};

type findManyArgs = {
  /**
   * Select specific fields to fetch from the row
   **/
  select?: Record<string, unknown> | null;
  /**
   * Filter, which row to fetch.
   **/
  where?: Record<string, unknown>;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of row to fetch.
   **/
  orderBy?: Record<string, unknown>;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing row.
   **/
  cursor?: Record<string, unknown>;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` row from the position of the cursor.
   **/
  take?: number;
};

type generatePrismaArgumentArgs = {
  searchableFields?: Array<string>;
  queryArgs?: query;
};

// generateStatement is generate statement for pagination, search, sort and filter
export function generatePrismaArguments({
  searchableFields,
  queryArgs,
}: generatePrismaArgumentArgs): findManyArgs {
  if (!queryArgs) {
    return {
      take: 10,
    };
  }

  const select = generateField(queryArgs.fields);
  const where = generateWhere(
    queryArgs.filter,
    queryArgs.search,
    searchableFields,
  );
  const orderBy = generateOrder(queryArgs.sort);
  const cursor = generateCursor(queryArgs.cursor);
  const take = generateTake(parseInt(queryArgs.limit ?? "10", 10));

  return {
    ...select,
    ...where,
    ...orderBy,
    ...cursor,
    ...take,
  };
}

function generateField(fields?: string) {
  if (!fields) {
    return {};
  }

  const select = fields
    .split(",")
    .map((field: string) => field.trim())
    .reduce((acc: Record<string, unknown>, curr: string): Record<
      string,
      unknown
    > => {
      acc[curr] = true;

      return acc;
    }, {});

  return { select };
}

function generateTake(take: number) {
  if (isNaN(take)) {
    return {
      take: 10,
    };
  }

  return { take };
}

function generateCursor(cursor?: string) {
  if (!cursor) {
    return {};
  }
  const cursorInt = parseInt(cursor, 10);

  return { skip: 1, cursor: { id: cursorInt } };
}

function generateOrder(order?: string) {
  if (!order) {
    return {};
  }

  const fields = order.split(",");
  const queryString = fields
    .map((field: string) => field.trim())
    .reduce((acc: Record<string, string>, curr: string): Record<
      string,
      string
    > => {
      const query = curr.split(" ");
      acc[query[0]] = query[1]?.toLowerCase() ?? "asc";

      return acc;
    }, {});

  return { orderBy: queryString };
}

function generateWhere(
  filters?: string,
  search?: string,
  searchableFields?: Array<string>,
) {
  const isSearchableFieldAvailable =
    searchableFields && searchableFields.length > 0;
  if (!filters && !search && !isSearchableFieldAvailable) {
    return {};
  }

  const whereQuery = generateFilter(filters);
  const searchQuery = generateSearch(searchableFields || [], search);
  const isFilterEmpty = whereQuery.length < 1 && searchQuery.length < 1;

  if (isFilterEmpty) {
    return {};
  }

  return {
    where: {
      AND: [...whereQuery, ...searchQuery],
    },
  };
}

function generateFilter(where?: string) {
  if (!where) {
    return [];
  }

  const filterQuery = where.split(" and ").map((filters: string) => {
    // TODO: Implement in, or, not, Precedence grouping ()
    const query = filters.split(" ");
    const field = query[0];
    const operator = query[1];
    const value = query
      .filter((_, index) => index > 1)
      .reduce((acc, curr, index) => {
        if (index === 0) {
          return curr;
        }

        return `${acc} ${curr}`;
      }, "");
    const operatorValue: Record<string, unknown> = {};

    // TODO: Change value based on data type
    operatorValue[operator] = transformFilterValue(value);

    const filter = createObjectFromBracketNotation(field, operatorValue);

    return filter;
  });

  return filterQuery;
}

function transformFilterValue(value: string) {
  // Test the value using regex
  // First test if there is a boolean/null
  // If the value is not boolean/null, parse it as a number
  // If it's not a number, then parse it as string
  return /^(true|false|null)$/.test(value)
    ? JSON.parse(value)
    : Number(value) || value;
}

// simplified from https://github.com/ljharb/qs/blob/master/lib/parse.js
function createObjectFromBracketNotation(
  key: string,
  val: unknown,
  options = { depth: 5 },
) {
  if (!key) {
    return;
  }

  // The regex chunks
  const brackets = /(\[[^[\]]*])/;
  const child = /(\[[^[\]]*])/g;

  // Get the parent
  let segment = brackets.exec(key);
  const parent = segment ? key.slice(0, segment.index) : key;

  // Stash the parent if it exists
  const keys = [];
  if (parent) {
    keys.push(parent);
  }

  // Loop through children appending to the array until we hit depth
  let i = 0;
  while (
    options.depth > 0 &&
    (segment = child.exec(key)) !== null &&
    i < options.depth
  ) {
    i += 1;
    keys.push(segment[1]);
  }

  // If there's a remainder, just add whatever is left
  if (segment) {
    keys.push("[" + key.slice(segment.index) + "]");
  }

  let leaf = val;

  for (let i = keys.length - 1; i >= 0; --i) {
    const obj = {} as Record<string, unknown>;
    const root = keys[i];

    const cleanRoot =
      root.charAt(0) === "[" && root.charAt(root.length - 1) === "]"
        ? root.slice(1, -1)
        : root;

    obj[cleanRoot] = leaf;

    leaf = obj;
  }

  return leaf;
}

function generateSearch(
  searchableFields: Array<string>,
  q?: string,
): Record<string, Prisma.StringFilter>[] {
  if (!q) {
    return [];
  }

  const searchQuery = searchableFields.map(searchableFiled => {
    const search: Record<string, Prisma.StringFilter> = {};
    search[searchableFiled] = { contains: q };

    return search;
  });

  return searchQuery;
}
