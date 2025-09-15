# RAG News Chatbot Frontend

A React-based frontend for the RAG-powered chatbot that provides an intuitive interface for news-related conversations.

## 🚀 Features

- **Modern Chat Interface**: Clean, responsive design with smooth animations
- **Real-time Messaging**: Send messages and receive AI responses instantly
- **Source Citations**: View and explore the news sources used for each response
- **Session Management**: Automatic session handling with persistent chat history
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant with proper focus management

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: SCSS
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Markdown**: react-markdown for formatted responses

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3001`

## ⚙️ Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 🚀 Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ChatMessage/          # Individual chat message component
│   ├── ChatInput/             # Message input with send functionality
│   ├── LoadingMessage/        # Typing indicator animation
│   └── SourcesPanel/          # Collapsible sources display
├── hooks/
│   └── useChat.ts            # Custom hook for chat functionality
├── services/
│   ├── apiService.ts         # HTTP API client
│   └── socketService.ts      # WebSocket client
├── types/
│   └── index.ts              # TypeScript type definitions
├── App.tsx                   # Main application component
└── App.scss                  # Global application styles
```

## 💬 Features Overview

### Chat Interface
- **Message Display**: Distinct styling for user and AI messages
- **Timestamps**: Shows when each message was sent
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: User-friendly error messages

### Source Citations
- **Expandable Panel**: Toggle sources visibility
- **Article Metadata**: Title, source, publication date
- **Relevance Scoring**: Color-coded relevance indicators
- **External Links**: Direct links to original articles

### Session Management
- **Auto-Session**: Automatic session creation and management
- **Persistent History**: Chat history survives page refreshes
- **Session Controls**: Clear chat or start new session

## 📄 License

MIT License - see LICENSE file for details.
