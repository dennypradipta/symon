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

import { useMutation, UseMutationResult } from "react-query";

import { post } from "./requests";
import Storage from "../utils/storage";

const storage = new Storage();

type UseLoginData = {
  result: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

type UseLoginVariables = { email: string; password: string };

export const useLogin = (): UseMutationResult<
  UseLoginData,
  Error,
  UseLoginVariables,
  unknown
> => {
  return useMutation(async variables => post("/auth", { body: variables }), {
    onSuccess(response) {
      setToken(response.data);
    },
    onError() {
      // do nothing
    },
  });
};

export const setToken = (data: {
  accessToken: string;
  refreshToken: string;
}): void => {
  const { accessToken, refreshToken } = data;

  if (accessToken) {
    storage.set("at", accessToken);
    if (refreshToken) {
      storage.set("rt", refreshToken);
    }
  } else {
    storage.del("at");
    storage.del("rt");
  }
};

export const getSavedTokens = (): {
  accessToken: string;
  refreshToken: string;
} => {
  return {
    accessToken: storage.get("at") || "",
    refreshToken: storage.get("rt") || "",
  };
};
