import { useEffect, useRef, useState } from 'react'
import { useMeetings } from './context/useMeetings.js'
import './App.css'

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getSpeakerTone(index) {
  return `tone-${(index % 4) + 1}`
}

function App() {
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])

  const {
    apiStatus,
    meetings,
    currentMeeting,
    loading,
    error,
    createMeeting,
    analyzeMeeting,
    loadMeeting,
    processDemo,
    updateMeetingTitle,
    exportMeeting,
    setError,
  } = useMeetings()

  const [meetingTitle, setMeetingTitle] = useState('Weekly product sync')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioMeta, setAudioMeta] = useState(null)
  const [isRunningDemo, setIsRunningDemo] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [statusText, setStatusText] = useState('Ready to record a meeting')

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    if (!isRecording) return undefined

    const timer = window.setInterval(() => {
      setRecordingSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    if (currentMeeting?.title) {
      setMeetingTitle(currentMeeting.title)
    }
  }, [currentMeeting?.title])

  async function startRecording() {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('This browser does not support microphone recording.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      streamRef.current = stream
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const nextAudioUrl = URL.createObjectURL(blob)

        setAudioUrl(nextAudioUrl)
        setAudioBlob(blob)
        setAudioMeta({
          durationSeconds: recordingSeconds,
          sizeBytes: blob.size,
          mimeType,
        })
        setStatusText('Recording captured. Analyze it to generate summary and action items.')

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      recorder.start()
      setRecordingSeconds(0)
      setAudioBlob(null)
      setAudioMeta(null)
      setIsRecording(true)
      setStatusText('Recording in progress')
    } catch {
      setError('Microphone access was blocked or failed.')
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state === 'inactive') return

    recorder.stop()
    setIsRecording(false)
  }

  async function handleAnalyzeMeeting() {
    setStatusText('Uploading audio and running analysis')

    try {
      await analyzeMeeting(meetingTitle, audioBlob)
      setStatusText('Analysis complete')
    } catch {
      setStatusText('Analysis failed')
    }
  }

  async function handleRunDemo() {
    setIsRunningDemo(true)
    setStatusText('Running demo analysis')

    try {
      let meetingId = currentMeeting?.id

      if (!meetingId) {
        const createdMeeting = await createMeeting(meetingTitle, audioMeta)
        meetingId = createdMeeting.id
      }

      if (!meetingId) {
        throw new Error('Create or select a meeting before running demo analysis.')
      }

      await processDemo(meetingId)
      setStatusText('Demo analysis complete')
    } catch (requestError) {
      setError(requestError.message)
      setStatusText('Demo analysis failed')
    } finally {
      setIsRunningDemo(false)
    }
  }

  async function handleUpdateTitle() {
    if (!currentMeeting) return

    setIsSavingTitle(true)
    setStatusText('Saving title')

    try {
      await updateMeetingTitle(currentMeeting.id, meetingTitle.trim())
      setStatusText('Meeting title updated')
    } catch {
      setStatusText('Failed to update title')
    } finally {
      setIsSavingTitle(false)
    }
  }

  async function handleExportMeeting() {
    if (!currentMeeting) return

    setIsExporting(true)
    setStatusText('Exporting meeting')

    try {
      const payload = await exportMeeting(currentMeeting.id)
      const fileBlob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const fileUrl = URL.createObjectURL(fileBlob)
      const link = document.createElement('a')

      link.href = fileUrl
      link.download = `${currentMeeting.title.replace(/\s+/g, '-').toLowerCase() || 'meeting'}.json`
      link.click()
      URL.revokeObjectURL(fileUrl)
      setStatusText('Meeting exported')
    } catch {
      setStatusText('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const analyzeDisabledReason = loading
    ? 'Wait for the current request to finish.'
    : isRecording
      ? 'Stop recording before analyzing.'
      : meetingTitle.trim().length === 0
        ? 'Add a meeting title first.'
        : !audioBlob
          ? 'Record and stop an audio clip first.'
          : ''

  const canAnalyze = !loading && !isRecording && meetingTitle.trim().length > 0 && Boolean(audioBlob)
  const canRunDemo = !loading && !isRunningDemo && !isRecording && Boolean(currentMeeting?.id)
  const canUpdateTitle =
    Boolean(currentMeeting) &&
    meetingTitle.trim().length > 0 &&
    meetingTitle.trim() !== currentMeeting?.title &&
    !isSavingTitle

  const speakerStats = currentMeeting?.speakerStats || []
  const transcript = currentMeeting?.transcript || []
  const actions = currentMeeting?.actions || []
  const summary = currentMeeting?.summary
  const speakerAnalysis = currentMeeting?.speakerAnalysis || null
  const displayedDuration = isRecording
    ? recordingSeconds
    : audioMeta?.durationSeconds || currentMeeting?.recording?.durationSeconds || 0
  const selectedWordCount = transcript.reduce((total, item) => {
    return total + item.text.split(/\s+/).filter(Boolean).length
  }, 0)
  const selectedSpeakerCount = speakerStats.length
  const totalTurns = speakerStats.reduce((total, item) => total + item.contributions, 0)

  return (
    <main className="app-shell">
      <div className="bg-animation" aria-hidden="true">
        <span className="bg-orb bg-orb-a"></span>
        <span className="bg-orb bg-orb-b"></span>
        <span className="bg-orb bg-orb-c"></span>
      </div>

      {loading ? (
        <div className="processing-overlay" role="status" aria-live="polite">
          <div className="processing-spinner"></div>
          <h2>Processing meeting intelligence</h2>
          <p>Running transcript segmentation, summarization, and action extraction.</p>
        </div>
      ) : null}

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Meeting Intelligence</p>
          <h1>Record a meeting, separate speakers, pull the signal out fast.</h1>
          <p className="hero-text">
            This MVP records audio in the browser, sends the clip to the API, and returns
            transcript, summary, decisions, risks, and next actions in one flow.
          </p>
        </div>

        <div className="hero-card">
          <div className="signal-row">
            <span className={`signal-dot ${isRecording ? 'live' : ''}`}></span>
            <span>{statusText}</span>
          </div>
          <p className="api-status">{apiStatus}</p>
          <div className="metric-grid">
            <article>
              <strong>{formatDuration(recordingSeconds)}</strong>
              <span>Live timer</span>
            </article>
            <article>
              <strong>{meetings.length}</strong>
              <span>Meetings stored</span>
            </article>
            <article>
              <strong>{audioMeta ? `${(audioMeta.sizeBytes / 1024).toFixed(1)} KB` : 'No clip'}</strong>
              <span>Latest recording</span>
            </article>
          </div>
          <p className="hero-note">
            Analyze meeting uploads the real recording to the backend. Demo analysis stays separate
            and only fills transcript, summary, speakers, and actions with mock data.
          </p>
        </div>
      </section>

      <section className="workspace">
        <div className="composer-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Capture</p>
              <h2>Record a meeting and choose real or demo analysis</h2>
            </div>
          </div>

          <label className="field">
            <span>Meeting title</span>
            <input
              value={meetingTitle}
              onChange={(event) => setMeetingTitle(event.target.value)}
              placeholder="Quarterly planning review"
            />
          </label>

          <div className="control-row">
            <button
              className="primary-button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              {isRecording ? 'Stop recording' : 'Start recording'}
            </button>
            <button
              className="secondary-button"
              onClick={handleAnalyzeMeeting}
              disabled={!canAnalyze}
              title={analyzeDisabledReason}
            >
              Analyze meeting
            </button>
            <button
              className="demo-button"
              onClick={handleRunDemo}
              disabled={!canRunDemo}
            >
              {isRunningDemo ? 'Running demo...' : 'Run demo analysis'}
            </button>
            <button
              className="ghost-button"
              onClick={handleUpdateTitle}
              disabled={!canUpdateTitle}
            >
              {isSavingTitle ? 'Saving...' : 'Update selected title'}
            </button>
            <button
              className="ghost-button"
              onClick={handleExportMeeting}
              disabled={!currentMeeting || isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>

          <div className="hint-grid">
            <article>
              <h3>Speaker identification</h3>
              <p>Speaker breakdown is shown with provenance so estimated labels are not confused with diarization.</p>
            </article>
            <article>
              <h3>Key point summary</h3>
              <p>The main analysis flow now targets the backend instead of injecting demo output.</p>
            </article>
            <article>
              <h3>Next steps</h3>
              <p>Use demo mode only when you want sample transcript, risks, and action items.</p>
            </article>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <strong>{formatDuration(displayedDuration)}</strong>
              <span>Recorder</span>
            </article>
            <article className="stat-card">
              <strong>{selectedSpeakerCount}</strong>
              <span>{speakerAnalysis?.mode === 'estimated' ? 'Estimated speakers' : 'Speakers'}</span>
            </article>
            <article className="stat-card">
              <strong>{selectedWordCount}</strong>
              <span>Words</span>
            </article>
            <article className="stat-card">
              <strong>{actions.length}</strong>
              <span>Action items</span>
            </article>
          </div>

          {audioUrl ? (
            <div className="audio-card">
              <div>
                <p className="section-label">Latest capture</p>
                <h3>{meetingTitle || 'Untitled meeting'}</h3>
              </div>
              <audio controls src={audioUrl} />
            </div>
          ) : null}

          {!canAnalyze && analyzeDisabledReason ? (
            <p className="helper-note">{analyzeDisabledReason}</p>
          ) : null}

          {error ? <p className="error-banner">{error}</p> : null}
        </div>

        <aside className="history-card">
          <div className="section-heading">
            <div>
              <p className="section-label">History</p>
              <h2>Previous analyses</h2>
            </div>
          </div>

          <div className="history-list">
            {meetings.length === 0 ? (
              <p className="empty-state">No meetings yet. Record one and run analysis.</p>
            ) : (
              meetings
                .slice()
                .reverse()
                .map((meeting) => (
                  <button
                    key={meeting.id}
                    className={`history-item ${currentMeeting?.id === meeting.id ? 'active' : ''}`}
                    onClick={() => loadMeeting(meeting.id)}
                    type="button"
                  >
                    <strong>{meeting.title}</strong>
                    <span>{meeting.status}</span>
                  </button>
                ))
            )}
          </div>
        </aside>
      </section>

      <section className="results-grid">
        <article className="result-card summary-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Summary</p>
              <h2>{currentMeeting?.title || 'Select a meeting result'}</h2>
            </div>
            {currentMeeting ? (
              <span className="meeting-badge">
                {currentMeeting.analysisMode === 'demo'
                  ? `${currentMeeting.status} · demo`
                  : currentMeeting.analysisMode === 'live-fallback'
                    ? `${currentMeeting.status} · fallback`
                    : currentMeeting.status}
              </span>
            ) : null}
          </div>

          {summary ? (
            <>
              <p className="overview">{summary.overview}</p>

              <div className="list-block">
                <h3>Key points</h3>
                <ul>
                  {summary.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="list-block">
                <h3>Decisions</h3>
                <ul>
                  {summary.decisions.map((decision) => (
                    <li key={decision}>{decision}</li>
                  ))}
                </ul>
              </div>

              <div className="list-block">
                <h3>Risks</h3>
                <ul>
                  {summary.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="empty-state">
              Run real analysis on a recording or use demo mode to generate sample output.
            </p>
          )}
        </article>

        <article className="result-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Speakers</p>
              <h2>Speaker breakdown</h2>
            </div>
          </div>

          {speakerAnalysis?.note ? (
            <p className="panel-note">{speakerAnalysis.note}</p>
          ) : null}

          {speakerStats.length > 0 ? (
            <div className="speaker-list">
              {speakerStats.map((speaker, index) => {
                const percentage = totalTurns > 0
                  ? Math.round((speaker.contributions / totalTurns) * 100)
                  : 0

                return (
                  <div className="speaker-row" key={speaker.speaker}>
                    <div className={`speaker-avatar ${getSpeakerTone(index)}`}>
                      {speaker.speaker.charAt(0)}
                    </div>
                    <div className="speaker-details">
                      <div className="speaker-copy">
                        <strong>{speaker.speaker}</strong>
                        <span>{speaker.speakingTime} speaking time</span>
                      </div>
                      <div className="speaker-bar-container">
                        <div
                          className={`speaker-bar ${getSpeakerTone(index)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <mark>{speaker.contributions} turns</mark>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">Speaker breakdown will appear after analysis.</p>
          )}
        </article>

        <article className="result-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Actions</p>
              <h2>Suggested next steps</h2>
            </div>
          </div>

          {actions.length > 0 ? (
            <div className="action-list">
              {actions.map((action) => (
                <div className="action-card" key={action.id}>
                  <strong>{action.text}</strong>
                  <p>
                    {action.owner} • {action.dueDate}
                  </p>
                  <span>{action.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Action items will appear after analysis.</p>
          )}
        </article>

        <article className="result-card transcript-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Transcript</p>
              <h2>Speaker-separated timeline</h2>
            </div>
          </div>

          {transcript.length > 0 ? (
            <div className="transcript-list">
              {transcript.map((entry, index) => (
                <div className="transcript-entry" key={entry.id}>
                  <div className={`speaker-avatar ${getSpeakerTone(index)}`}>
                    {entry.speaker.charAt(0)}
                  </div>
                  <div className="transcript-content">
                    <div className="transcript-meta">
                      <strong>{entry.speaker}</strong>
                      <span>{entry.timestamp}</span>
                    </div>
                    <p>{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Transcript segments will appear after analysis.</p>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
