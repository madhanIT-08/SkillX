# SkillX: Innovate, Educate, Elevate 🚀

> A Peer-to-Peer Skill Exchange Platform built with the MERN Stack.

## 📖 Overview
**SkillX** is a web platform designed to facilitate the barter of skills without monetary transactions. It allows users to find mentors or peers who can teach them a desired skill in exchange for a skill they can offer. The platform emphasizes security and trust through a unique **Shared Session Passkey** mechanism for real-time collaboration.

## 🌟 Key Features
- **User Authentication**: Secure JWT-based registration and login.
- **Profile Management**: Users can list **Skills Offered** and **Skills Needed**.
- **Skill Discovery**: Search functionality to find peers by skill name.
- **Request System**: Send, Accept, and Reject mentorship requests.
- **Secure Sessions**:
    - **Passkey Verification**: A unique, temporary passkey (`SKX-XXXX`) is generated upon request acceptance.
    - **Access Control**: Only users with the correct passkey can enter the session room.
- **Real-Time Collaboration**:
    - **Live Chat**: Instant messaging using Socket.io.
    - **Resource Sharing**: Share documentation links and files within the session.

## 🛠 Technology Stack
- **Frontend**: React.js (Vite), React Router, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

## 📂 Project Structure
```
SkillX/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, ProtectedRoute)
│   │   ├── context/        # Global State (AuthContext)
│   │   ├── pages/          # Application Pages (Dashboard, Session, etc.)
│   │   └── App.jsx         # Routing Logic
├── server/                 # Node.js Backend
│   ├── config/             # Database Connection
│   ├── controllers/        # Business Logic (Auth, User, Request, Session)
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   └── server.js           # Entry Point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas URL)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/skillx.git
    cd SkillX
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    # Create a .env file with:
    # MONGO_URI=mongodb://localhost:27017/skillx
    # JWT_SECRET=your_secret_key
    # PORT=5000
    npm run server # or nodemon server.js
    ```

3.  **Client Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access the App**
    - Open `http://localhost:5173` in your browser.

## 📸 Screenshots
*(Add screenshots of your Dashboard, Login, and Session pages here)*

## 🔮 Future Enhancements
- Video Calling (WebRTC integration)
- User Reputation/Rating System
- Calendar Scheduling for Sessions

## 📝 License
This project is for educational purposes.
