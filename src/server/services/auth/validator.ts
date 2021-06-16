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

import Joi from "joi";

export const loginRequesBodytValidator = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const refreshRequestBodyValidator = Joi.object().keys({
  refreshToken: Joi.string().required(),
});

export const changePasswordValidator = Joi.object().keys({
  oldPassword: Joi.string().required().label("Old password"),
  newPassword: Joi.string().required().min(5).label("New password"),
  confirmPassword: Joi.string()
    .required()
    .min(5)
    .label("Password confirmation"),
});
