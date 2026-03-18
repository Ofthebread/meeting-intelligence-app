# 🎙️ Meeting Intelligence App - MVP

A web application that records meetings, identifies speakers, summarizes key points, and suggests action items.

## ✨ Features

- 🔴 **Audio Recording** - Record meetings directly in the browser
- 👥 **Speaker Identification** - Separate speakers in transcripts (demo mode)
- 📝 **Live Transcription** - Real-time transcript display
- 🤖 **AI Summary** - Automatic key point extraction and summarization
- ⚡ **Action Items** - Suggested next steps with owners and due dates
- 📊 **Speaker Analytics** - Participation statistics and speaking time
- 💾 **Meeting History** - Save and revisit past meetings
- 📤 **Export** - Download meeting data as JSON

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and navigate to the project:**

    ```bash
    cd meeting-intelligence-app
    ```

2. **Install server dependencies:**

    ```bash
    cd server
    npm install
    ```

3. **Install client dependencies:**

    ```bash
    cd ../client
    npm install
    ```

4. **Start the backend server:**

    ```bash
    cd ../server
    npm run dev
    ```

    Server runs on http://127.0.0.1:4000

5. **Start the frontend (in a new terminal):**
    ```bash
    cd ../client
    npm run dev
    ```
    Client runs on http://127.0.0.1:5173

## 🎯 How to Use

1. **Open the app** at http://127.0.0.1:5173
2. **Enter a meeting title** in the text field
3. **Click "Start recording"** and grant microphone permissions
4. **Record your meeting** - the timer shows recording duration
5. **Click "Stop recording"** when finished
6. **Choose analysis mode:**
    - **"Run demo analysis"** - Uses sample data (works without API keys)
    - **"Analyze meeting"** - Uploads audio for real AI processing (requires OpenAI API key)

## 🔧 Configuration

### For Real AI Analysis

Copy the example env file first:

```bash
cp server/.env.example server/.env
```

Then add your AssemblyAI API key to `server/.env`:

```
ASSEMBLYAI_API_KEY=...
```

### API Key Safety

- Keep `ASSEMBLYAI_API_KEY` only in `server/.env`
- Never put secrets in the frontend or in `VITE_*` variables
- Never commit `.env` files
- If a key is ever pasted into chat, screenshots, or code, revoke it immediately and create a new one
- Use service-account or restricted keys for app backends when possible

### Environment Variables

- `PORT` - Server port (default: 4000)
- `CLIENT_URL` - Frontend URL (default: http://127.0.0.1:5173)
- `ASSEMBLYAI_API_KEY` - Your AssemblyAI API key (optional for demo mode)

## 🏗️ Architecture

### Frontend (React + Vite)

- **Audio Recording:** Web Audio API + MediaRecorder
- **State Management:** React hooks
- **Styling:** Custom CSS with animations
- **API Calls:** Fetch API

### Backend (Node.js + Express)

- **Audio Processing:** Multer for file uploads
- **AI Integration:** AssemblyAI transcription + LeMUR analysis
- **Data Storage:** In-memory (for MVP)
- **File Storage:** Local uploads directory

## 📁 Project Structure

```
meeting-intelligence-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   └── App.css        # Styling
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   └── data/          # Demo data
│   └── package.json
└── README.md
```

## 🔮 MVP Limitations

- **Storage:** Meetings stored in memory (lost on restart)
- **AI:** Real analysis requires AssemblyAI API key
- **Speaker ID:** Demo mode only (no real diarization)
- **Audio:** No audio compression or cloud storage
- **Auth:** No user authentication

## 🚧 Roadmap (Future Enhancements)

- [ ] Persistent database storage
- [ ] Real-time speaker diarization
- [ ] Cloud audio storage (AWS S3)
- [ ] User authentication
- [ ] Meeting sharing and collaboration
- [ ] Mobile app
- [ ] Integration with calendar apps
- [ ] Export to PDF/Word formats

## 🛠️ Development

### Adding New Features

1. Backend changes: Add routes in `server/src/routes/`
2. Frontend changes: Modify `client/src/App.jsx`
3. Test both servers are running

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - List meetings
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/analyze` - Analyze with audio upload
- `POST /api/meetings/:id/process-demo` - Demo analysis
- `PATCH /api/meetings/:id` - Update meeting
- `GET /api/meetings/:id/export` - Export meeting data

## 📄 License

This project is for educational and demonstration purposes.
