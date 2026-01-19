# Deployment Guide for SkillX

## Prerequisites
- GitHub Account
- Accounts on deployment platforms (e.g., Vercel, Render, Railway)
- MongoDB Atlas Account (for cloud database)

## 1. Database Setup

### Option A: Local MongoDB (For Development)
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Install it on your machine.
3. Start the MongoDB service.
4. Your connection string will be: `mongodb://localhost:27017/skillx`
5. In `server/.env`, set `MONGO_URI=mongodb://localhost:27017/skillx`

### Option B: MongoDB Atlas (Recommended for Deployment)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Cluster**: Click "Build a Database" and select the free Shared Tier.
3. **Set Up Security**:
   - Go to **Network Access** -> **Add IP Address** -> **Allow Access from Anywhere** (0.0.0.0/0).
   - Go to **Database Access** -> **Add New Database User**.
4. **Get Connection String**:
   - Click **Connect** on your cluster.
   - Choose **Connect your application**.
   - Copy the URI, replacing `<password>` with your user password.
## 2. Pushing to GitHub (Required for Step 3 & 4)
Before you can deploy to Render or Vercel, your code must be on GitHub.

1.  **Initialize Git**: In your main project folder (`SkillX`), run:
    ```powershell
    git init
    git add .
    git commit -m "Initialize SkillX project"
    ```
2.  **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new **Private** repository named `SkillX`.
3.  **Push Code**: Follow the "push an existing repository from the command line" instructions on GitHub:
    ```powershell
    git remote add origin https://github.com/yourusername/SkillX.git
    git branch -M main
    git push -u origin main
    ```

## 3. Server Deployment (Render/Railway)
**Using Render:**
1. Connect your GitHub repository.
2. Select the `server` directory as the Root Directory.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. **Environment Variables**:
   - `MONGO_URI`: Your Atlas connection string (from Step 1)
   - `JWT_SECRET`: A strong random string
   - `PORT`: 5000

## 4. Client Deployment (Vercel)
**Using Vercel:**
1. Connect your GitHub repository.
2. Select the `client` directory as the Root Directory.
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. **Environment Variables**:
   - `VITE_API_URL`: The URL provided by Render (e.g., `https://skillx-api.onrender.com`)

## 4. Local Network Access (Access from another PC)
To access SkillX from another computer on your same Wi-Fi:

1.  **Find your IP**: Run `ipconfig` (Windows). Your IP is: `10.80.232.223`.
2.  **Update Frontend**: In `client/.env`, set:
    `VITE_API_URL=http://10.80.232.223:5000`
3.  **Start Client with Host**: Run the client with the `--host` flag:
    `cd client; npm run dev -- --host`
4.  **Access from other PC**: Open the browser on the other PC and go to `http://10.80.232.223:5173`.

## 5. Final Deployment Checklist
- [ ] Check `server/.env` has `MONGO_URI` and `JWT_SECRET`.
- [ ] Ensure `client/.env` has `VITE_API_URL` pointing to your deployed backend.
- [ ] Ensure CORS is set to `origin: "*"` in `server.js` for testing.
