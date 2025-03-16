# 📌 Chat App

## 🚀 Overview
Chat App is a **real-time messaging application** built primarily for **backend development experience**. The main goal was to create a **scalable and efficient backend** using **Django REST Framework (DRF) for API development** and **Node.js with WebSockets for real-time communication**. The app features user authentication, a friend system, and instant messaging capabilities.

---

## 🔹 Features

### 1️⃣ User Authentication
- Secure **register, login, and logout** functionality.
- JWT-based authentication with **access and refresh tokens**.
- Automatic **token refresh** to maintain user sessions.

### 2️⃣ Friend System
- **Send, accept, and reject friend requests**.
- Users can only chat with **accepted friends**.
- Ability to **remove friends** at any time.

### 3️⃣ Chat Functionality
- **Real-time messaging** powered by WebSockets.
- **Chat rooms** where users can join and leave dynamically.
- **Messages are stored in a database** to persist conversations.
- **Formatted timestamps** for improved readability.

### 4️⃣ WebSocket Integration
- Users **join a chat room** when they open a conversation.
- Messages **instantly appear** for all participants.
- WebSockets ensure **low-latency, real-time communication**.

### 5️⃣ User Experience Enhancements
- **Dynamic message updates** (no need to refresh the page).
- **Usernames are correctly displayed** instead of generic IDs.
- **Friend list updates automatically** when requests are handled.

---

## 🛠 Technologies Used

### 🔹 Frontend (Angular)
- **Angular (latest version)** for UI development.
- **Angular Services** for managing authentication, chat, and WebSockets.
- **JWT Interceptor** to handle authentication tokens.

### 🔹 Backend (Django & Node.js WebSockets)
- **Django REST Framework (DRF)** for REST API development.
- **PostgreSQL** for storing users, chats, and messages.
- **Django Simple JWT** for authentication management.
- **Node.js + WebSockets** for real-time chat features.

---

## 🔹 How It Works

### 1️⃣ User Flow
- Users **register and log in**.
- They can **send friend requests** to other users.
- Once **friends**, users can **start private chats**.

### 2️⃣ Chat Flow
- Messages are **sent in real-time** via WebSockets.
- Messages are also **stored in the database** for persistence.
- Chat history is **loaded on page refresh**.

### 3️⃣ WebSocket Events
- **Users join a room** when they open a chat.
- Messages are **broadcasted** to all users in the room.
- If a user **leaves the chat**, the connection closes.

---

## 📌 Conclusion
This project was primarily developed to gain **backend development experience**, focusing on **real-time WebSocket integration** and **efficient database management**. The **combination of Django for API development and Node.js for WebSockets** ensures a **robust, scalable, and fast** chat application.

🚀 **The Chat App is a great foundation for expanding into a full-featured messaging platform!** 🔥

