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

import { FunctionComponent, useState } from "react";

import { Alert, Button, Form, Input, Layout, Title } from "../../components";
import { fetcher } from "../../data/requests";
import { useForm } from "../../hooks/use-form";
import { logout } from "../../utils/auth";

const Account: FunctionComponent = () => {
  const { values, setFieldValue } = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<"error" | "success">();
  const [message, setMessage] = useState<string>();
  const { oldPassword, newPassword, confirmPassword } = values;
  const disableButton =
    isSubmitting || !oldPassword || !newPassword || !confirmPassword;

  const handleSubmit = async () => {
    // prevents double submit
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetcher(`/auth/change-password`, {
        method: "PUT",
        body: {
          oldPassword,
          newPassword,
          confirmPassword,
        },
      });

      setFormState("success");
      setMessage(res.message);
      logout();
    } catch (error) {
      setFormState("error");
      setMessage(error?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Title level={4}>Change Password</Title>
      {formState && (
        <Alert
          type={formState}
          message={formState === "success" ? "Success" : "Error"}
          description={message}
        />
      )}
      <div className="mt-6">
        <Form.Item layout="vertical" label="Old Password">
          <Input
            type="password"
            name="oldPassword"
            onChange={e => setFieldValue("oldPassword", e.target.value)}
            autoFocus
          />
        </Form.Item>
        <Form.Item layout="vertical" label="New Password">
          <Input
            type="password"
            name="newPassword"
            onChange={e => setFieldValue("newPassword", e.target.value)}
          />
        </Form.Item>
        <Form.Item layout="vertical" label="Repeat New Password">
          <Input
            type="password"
            name="confirmPassword"
            onChange={e => setFieldValue("confirmPassword", e.target.value)}
          />
        </Form.Item>
      </div>
      <Button
        size="medium"
        label={isSubmitting ? "Loading..." : "Update Password"}
        variant={disableButton ? "light" : "dark"}
        disabled={disableButton}
        onClick={handleSubmit}
      />
    </Layout>
  );
};

export default Account;
