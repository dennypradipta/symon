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

import { ProjectRepository } from "./../services/projects/repository";
import { OrganizationRepository } from "./../services/organizations/repository";
import { UserRepository } from "./../services/users/repository";
import {
  MonikaRepository,
  ReportRepository,
} from "./../services/monika/repository";
import { ProbeRepository } from "../services/probes/repository";
import { ReportRequestRepository } from "./../services/report-requests/repository";
import { ConfigRepository } from "./../services/config/repository";
import { ReportRequestAlertRepository } from "../services/report-alerts/repository";
import { ReportNotificationRepository } from "./../services/report-alerts/repository";

export default async function seed(): Promise<void> {
  const user = new UserRepository();
  const organization = new OrganizationRepository();
  const project = new ProjectRepository();
  const probe = new ProbeRepository();
  const monika = new MonikaRepository();
  const report = new ReportRepository();
  const reportRequest = new ReportRequestRepository();
  const reportRequestAlerts = new ReportRequestAlertRepository();
  const reportNotifications = new ReportNotificationRepository();
  const config = new ConfigRepository();

  await user.upsert({
    where: { email: "admin@symon.org" },
    update: {},
    create: {
      email: "admin@symon.org",
      password_hash:
        "$argon2d$v=19$m=1024,t=1,p=1$c29tZXNhbHQ$vMacEP0ocxrbJBctoJAdg+hYD8DrnAnR5d4x4YL3RHU", //hashed password from: right password
      enabled: 1,
      suspended: 0,
    },
  });

  await organization.create({
    name: "hyperjump",
    description: "Open source first. Cloud native. DevOps excellence.",
  });

  await project.create({
    name: "hyperjump",
    organization_id: 1,
  });

  await probe.create({
    name: "sample-probe",
    description: "sample-probe",
    alerts: null,
    interval: null,
    incidentThreshold: null,
    recoveryThreshold: null,
    enabled: null,
    requests: [],
  });

  await monika.create({
    hostname: "example.com",
    instanceId: "southeast-asia-1",
  });

  await report.create({
    monikaId: 1,
    configVersion: "1.0.0",
    monikaInstanceId: "southeast-asia-1",
    data: {
      requests: [],
      notifications: [],
    },
  });

  await probe.createProbeRequest({
    probeId: 1,
    method: "GET",
    timeout: 10000,
    headers: null,
    body: null,
    url: "http://example.com",
  });

  const reportRequestsSeed = [];
  for (let i = 0; i < 35; i++) {
    reportRequestsSeed[i] = reportRequest.create({
      reportId: 1,
      probeId: "sample-probe",
      probeName: "sample-probe",
      requestMethod: "GET",
      requestHeader: null,
      requestBody: null,
      requestUrl: "https://example.com",
      timestamp: 0,
      responseStatus: 200,
      responseHeader: null,
      responseBody: null,
      responseTime: 3,
      responseSize: null,
    });
  }
  await Promise.all(reportRequestsSeed);

  const reportRequestsAlertsSeed = [];
  for (let i = 0; i < 35; i++) {
    reportRequestsAlertsSeed[i] = reportRequestAlerts.create({
      reportRequestId: 1,
      alert: "response-time-greater-than-2-s",
    });
  }
  await Promise.all(reportRequestsAlertsSeed);

  const reportNotificationsSeed = [];
  for (let i = 0; i < 35; i++) {
    reportNotificationsSeed[i] = reportNotifications.create({
      probeName: "sample-probe",
      timestamp: 0,
      type: i % 2 === 0 ? "NOTIFY-INCIDENT" : "NOTIFY-RECOVERY",
      alert: "response-time-greater-than-2-s",
      reportId: 1,
      probeId: "sample-probe",
      notificationId: "sample-notification",
      channel: "slack",
    });
  }
  await Promise.all(reportNotificationsSeed);

  const configs = [
    { key: "env", value: process.env.NODE_ENV || "development" },
    { key: "jwtSecret", value: process.env.PORT || "8080" },
    { key: "dbHost", value: process.env.DATABASE_URL || "file:./dev.db" },
    { key: "jwtSecret", value: process.env.JWT_SECRET || "thisIsJwtSecret" },
    { key: "jwtIssuer", value: process.env.JWT_ISSUER || "symon.org" },
    { key: "jwtAccessExpired", value: process.env.JWT_ACCESS_EXPIRED || "5m" },
    {
      key: "jwtRefreshExpired",
      value: process.env.JWT_REFRESH_EXPIRED || "1y",
    },
    { key: "jwtAlgorithm", value: process.env.JWT_ALGORITHM || "HS256" },
  ];

  configs.map(async c => {
    await config.upsert({
      where: { key: c.key },
      update: {},
      create: {
        key: c.key,
        value: c.value,
      },
    });
  });
}
