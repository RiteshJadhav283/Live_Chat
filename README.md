# Real Time Chat Application

A real-time chat application built with Firebase and vanilla JavaScript.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real-Time-Chatting
   ```

2. **Set up Firebase**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Go to Project Settings > General > Your Apps
   - Click on the web app (</>) icon to register a new web app
   - Copy the Firebase configuration object

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration details
   ```bash
   cp Frontend/.env.example Frontend/.env
   ```
   - Open `Frontend/.env` and replace the placeholder values with your Firebase configuration

4. **Run the application**
   - You'll need a local server to run the application. You can use Python's built-in server:
     ```bash
     cd Frontend
     python -m http.server 8000
     ```
   - Or use Live Server in VS Code
   - Open `http://localhost:8000` in your browser

## Features

- Real-time messaging
- Edit and delete messages
- Responsive design
- No page refresh needed

## Dependencies

- Firebase (loaded via CDN)
- Material Icons (for the send button)
