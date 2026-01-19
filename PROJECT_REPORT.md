# Project Report: SkillX

**Title**: SkillX: Peer-to-Peer Skill Exchange Platform
**Domain**: Web Development (Full Stack)
**Technology**: MERN Stack (MongoDB, Express, React, Node.js)

---

## 1. Abstract
In the modern digital era, learning new skills often requires expensive courses or structured institutions. **SkillX** is proposed as an alternative solution: a decentralized, peer-to-peer platform where knowledge is the currency. Users exchange skills (e.g., "I teach you React, you teach me Guitar") in a secure, collaborative environment. The system solves the problem of cost and accessibility by leveraging community knowledge.

## 2. Problem Statement
Existing learning platforms are either:
1.  **Expensive**: Paid courses (Udemy, Coursera).
2.  **Passive**: One-way video consumption (YouTube) without feedback.
3.  **Unstructured**: Finding a dedicated mentor on generic social media is difficult.

There is a need for a dedicated platform that connects *Specific Skill Seekers* with *Specific Skill Providers* for mutual benefit.

## 3. Objectives
- To build a responsive web application for skill profile management.
- To implement a search algorithm to match peers based on skill tags.
- To create a secure request-acceptance workflow.
- To provide a private, verified virtual classroom ("Session") using the innovative **Shared Session Passkey** mechanism.
- To facilitate real-time communication via chat and resource sharing.

## 4. System Architecture
The application follows the **Client-Server Architecture**:
- **Client (Frontend)**: Built with **React.js**, it handles the user interface and interacts with the API via REST calls. It manages state (User Auth) using React Context API.
- **Server (Backend)**: Built with **Node.js** and **Express.js**, it processes requests, handles business logic, and ensures security via JWT authentication.
- **Database**: **MongoDB** stores unstructured data like user profiles, skill arrays, and session logs in JSON-like documents.

## 5. Modules Description

### 5.1 Authentication Module
- **Registration**: Captures user name, email, and password.
- **Login**: Verifies credentials and issues a JSON Web Token (JWT).
- **Security**: Passwords are hashed using `bcrypt` before storage.

### 5.2 Discovery & Matching Module
- Users define their "Offered" and "Required" skills.
- The search engine filters users based on the `skillsOffered` array.

### 5.3 Request Management Module
- Users send connection requests.
- Recipients can "Accept" or "Reject".
- **Logic**: Acceptance automatically triggers the creation of a `Session` record in the database.

### 5.4 Secure Session Module (Core Feature)
- **Problem**: Preventing unauthorized users from joining a meeting.
- **Solution**: A 5-character alphanumeric **Passkey** is generated.
- **Verification**: The system checks if the entering user matches the Passkey AND is a participant in that specific session.

### 5.5 Collaboration Module
- **Chat**: Real-time bidirectional communication using **Socket.io**.
- **Resources**: CRUD operations for sharing URL links (Google Drive, Docs) associated with the session ID.

## 6. Conclusion
SkillX successfully demonstrates a functional full-stack application that solves real-world learning connection problems. It integrates modern web technologies to provide a seamless, secure, and interactive user experience.

## 7. Future Scope
- **Video Calling**: Integrating WebRTC for face-to-face mentorship.
- **Gamification**: Badges and leaderboards for top mentors.
- **AI Matching**: Using machine learning to suggest the best peer matches based on learning history.
