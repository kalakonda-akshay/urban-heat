# UrbanHeat AI — Production Deployment Guide

This guide details how to deploy the entire **UrbanHeat AI (ISRO BAH Platform)** full-stack application (React Frontend + FastAPI Backend + PostGIS Spatial Database) to free-tier cloud platforms (**Vercel** and **Render**).

---

## Architecture Overview

```
 ┌─────────────────────────┐         ┌─────────────────────────┐
 │   Vercel / Render       │  HTTP   │   Render Web Service    │
 │ React Frontend (Vite)   ├────────►│   FastAPI Backend (Py)  │
 └─────────────────────────┘         └────────────┬────────────┘
                                                  │ PostGIS
                                                  ▼
                                     ┌─────────────────────────┐
                                     │   Render PostgreSQL     │
                                     │   (PostGIS Enabled)     │
                                     └─────────────────────────┘
```

---

## Deployment Option 1: 1-Click Render Blueprint (Recommended)

Render can automatically spin up the **Backend**, **PostgreSQL Database**, and **Frontend** using the included `render.yaml` file.

### Steps:
1. Push your repository code to GitHub or GitLab.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and create 3 services:
   - `urbanheat-db` (PostgreSQL with PostGIS extensions)
   - `urbanheat-backend` (FastAPI Docker Web Service)
   - `urbanheat-frontend` (Static Web Site)
6. Click **Apply**. Once built:
   - Your frontend will be live at `https://urbanheat-frontend.onrender.com`
   - Your backend API will be live at `https://urbanheat-backend.onrender.com`

---

## Deployment Option 2: Vercel (Frontend) + Render (Backend)

For fast global CDN performance for the frontend, deploy the React app to **Vercel** and the API backend to **Render**.

### Step 1: Deploy Backend & Database on Render
1. Create a PostgreSQL Database on Render named `urbanheat-db`.
2. Create a Web Service for `backend`:
   - **Environment**: `Docker`
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Environment Variables**:
     - `DATABASE_URL`: Your Render PostgreSQL connection string.
     - `SECRET_KEY`: Generate a random secure key.
3. Save and deploy. Note your backend URL (e.g. `https://urbanheat-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New** → **Project** and import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variables**:
   - `VITE_API_URL`: `https://urbanheat-backend.onrender.com/api/v1`
6. Click **Deploy**. Vercel will build the frontend and serve it globally on HTTPS!

---

## Deployment Option 3: Single VPS (Docker Compose)

To deploy on your own server (AWS EC2, DigitalOcean, Hetzner, Linode):

1. SSH into your server:
   ```bash
   ssh ubuntu@your-server-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/your-username/isro-project.git
   cd isro-project
   ```
3. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Configure Nginx with SSL (Certbot) for domain routing.

---

## Production Health Checks & Diagnostics

- **Backend Health Check**: `https://your-backend-url/api/v1/health`
- **Interactive Swagger Docs**: `https://your-backend-url/docs`
- **Default Admin User**: `admin@urbanheatai.gov.in` / `urbanheatsecretpass`
