# 🌱 Agroetica — Frontend Platform for Regenerative Farm Compliance

### Dashboard View
![Agroetica UI Screenshot](docs/agroetica_dashboard.png)

### Crop Management View
![Crop Management](./agroetica_crop_management.png)

### Admin Panel
![Admin Panel](./agroetica_admin.png)

**Agroetica** is a full-stack agentic platform for sustainable agriculture, delivering near real-time compliance insights to regenerative farms using Sentinel-2 satellite data, GenAI, and scalable cloud infrastructure.

This repo contains the **frontend web platform** built in **Next.js** — supporting insight visualisation, offline-first functionality, and a modular architecture designed for rapid iteration and AI agent integration.

> 🛰️ Built for real-world diagnostics. Designed for scale. Powered by GenAI.

---

## 🧭 Core Features

- 🌍 **Geospatial Insights** – Visualise Sentinel-2 vegetation indices (NDVI, NDWI, BSI) to detect treatment violations
- 🧠 **GenAI Agents** – Embedded retrieval-augmented agents for natural language compliance queries
- 📶 **Offline-Capable PWA** – Service worker caching, sync strategy, and mobile-first UX for rural environments
- 🧰 **Admin & Internal Tools** – QR-based sample tracking, audit logs, crop health alerts
- 🧪 **Modular UI Architecture** – Built for rapid prototyping and integration with backend APIs

---

## 🏗️ Tech Stack

| Layer              | Tech Used                                 |
|--------------------|--------------------------------------------|
| Frontend Framework | **Next.js**, TypeScript, React             |
| State Management   | React Context, SWR                         |
| Styles & UI        | Tailwind CSS, Headless UI, Geist Font      |
| Data Fetching      | API Routes, GraphQL Integration (planned) |
| Offline Strategy   | Service Workers, Cache API                |
| Deployment         | Vercel + GitHub Actions CI/CD             |

---

## 🧪 Local Development

Clone the repo and install dependencies:

```bash
git clone https://github.com/castillofranciscoj/agroetica-fe
cd agroetica-fe
npm install
