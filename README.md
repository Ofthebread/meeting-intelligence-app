# Meeting Intelligence App

Web app for recording meetings, sending the audio to a separate transcription service, and showing transcript, summary, speaker stats, and action items.

This repository is the product app. Audio transcription and basic insights now live in a separate repo: `audio-intelligence-api`.

## Current Flow

- the browser records audio with `MediaRecorder`
- the app backend receives the upload
- the backend forwards the file to `audio-intelligence-api`
- `audio-intelligence-api` converts browser audio when needed and runs local Whisper
- the result comes back as transcript, summary, actions, and speaker stats

Demo analysis still exists, but it is separate from the real audio flow.

## Repositories

- `meeting-intelligence-app`: frontend + product backend
- `audio-intelligence-api`: reusable audio/transcription service

The app backend expects the audio API at `http://127.0.0.1:4100` by default.

## Quick Start

### 1. Install dependencies

From this repo:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

The separate `audio-intelligence-api` repo also needs its own dependencies installed.

### 2. Configure env

Copy the server env file:

```bash
cp server/.env.example server/.env
```

The important variable is:

```env
AUDIO_INTELLIGENCE_API_URL=http://127.0.0.1:4100
```

### 3. Start everything

From the root of this repo:

```bash
npm run dev
```

That command starts:

- `audio-intelligence-api`
- the meeting app backend on `http://127.0.0.1:4000`
- the frontend on `http://127.0.0.1:5173`

## How To Use

1. Open `http://127.0.0.1:5173`
2. Enter a meeting title
3. Start recording
4. Stop recording
5. Click `Analyze meeting` for the real local pipeline
6. Use `Run demo analysis` only for mock data

## Environment

Real config for this app lives in:

- [server/.env.example](/Users/angeladelpan/Desktop/meeting-intelligence-app/meeting-intelligence-app/server/.env.example)
- `server/.env`

Audio service config lives in the separate `audio-intelligence-api` repo.

## API Endpoints

- `GET /api/health`
- `GET /api/meetings`
- `GET /api/meetings/:id`
- `POST /api/meetings`
- `POST /api/meetings/analyze`
- `POST /api/meetings/:id/process-demo`
- `PATCH /api/meetings/:id`
- `GET /api/meetings/:id/export`

## Current Limitations

- meetings are stored in memory
- speaker diarization is not implemented yet
- speaker timeline is estimated from transcript segments, not real speaker turns
- key points still come from a simple fallback heuristic in the audio service

## Project Structure

```text
meeting-intelligence-app/
├── client/
├── server/
├── package.json
└── README.md
```
