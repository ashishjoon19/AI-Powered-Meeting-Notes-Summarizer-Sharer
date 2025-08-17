import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Meeting {
  id: number;
  transcript: string;
  prompt: string;
  summary: string;
  created_at: string;
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const generateSummary = async () => {
    if (!transcript.trim() || !prompt.trim()) {
      setMessage({ type: 'error', text: 'Please provide both transcript and prompt' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/generate-summary', {
        transcript: transcript.trim(),
        prompt: prompt.trim()
      });

      setSummary(response.data.summary);
      setMeetingId(response.data.meetingId);
      setMessage({ type: 'success', text: 'Summary generated successfully!' });
    } catch (error: any) {
      console.error('Error generating summary:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to generate summary' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSummary = async () => {
    if (!meetingId || !summary.trim()) {
      setMessage({ type: 'error', text: 'Cannot update summary' });
      return;
    }

    try {
      await axios.put(`/api/meeting/${meetingId}/summary`, {
        summary: summary.trim()
      });

      setMessage({ type: 'success', text: 'Summary updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating summary:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update summary' 
      });
    }
  };

  const shareSummary = async () => {
    if (!meetingId || !summary.trim() || !recipientEmails.trim()) {
      setMessage({ type: 'error', text: 'Please provide recipient emails' });
      return;
    }

    try {
      await axios.post('/api/share-summary', {
        meetingId,
        summary: summary.trim(),
        recipientEmails: recipientEmails.trim()
      });

      setMessage({ type: 'success', text: 'Summary shared successfully!' });
      setRecipientEmails('');
    } catch (error: any) {
      console.error('Error sharing summary:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to share summary' 
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('text/') && !file.name.endsWith('.txt')) {
      setMessage({ type: 'error', text: 'Only text files (.txt) are allowed' });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      return;
    }

    setUploadedFile(file);
    setMessage({ type: 'info', text: `File "${file.name}" selected. Click "Upload & Extract Text" to continue.` });
  };

  const uploadAndExtractText = async () => {
    if (!uploadedFile) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('transcript', uploadedFile);

      const response = await axios.post('/api/upload-transcript', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTranscript(response.data.transcript);
      setMessage({ type: 'success', text: `Text extracted from "${uploadedFile.name}" successfully!` });
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to upload file' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setTranscript('');
    setPrompt('');
    setSummary('');
    setMeetingId(null);
    setRecipientEmails('');
    setMessage(null);
    setIsEditing(false);
    setUploadedFile(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Meeting Summarizer
          </h1>
          <p className="text-gray-600">
            Upload text files or paste transcripts to generate AI-powered summaries with custom instructions
          </p>
        </header>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Input Transcript & Instructions</h2>
          
          <div className="form-group">
            <label className="form-label">Upload Transcript File (Optional)</label>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept=".txt,text/*"
                onChange={handleFileUpload}
                className="form-input"
                disabled={isLoading}
              />
              {uploadedFile && (
                <button
                  className="btn btn-secondary"
                  onClick={uploadAndExtractText}
                  disabled={isLoading}
                >
                  Upload & Extract Text
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: .txt files only. Max size: 10MB
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Transcript</label>
            <textarea
              className="form-input form-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript, call recording transcript, or meeting notes here... Or upload a .txt file above."
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Instructions</label>
            <textarea
              className="form-input form-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items' or 'Create a timeline of events'"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={generateSummary}
              disabled={isLoading || !transcript.trim() || !prompt.trim()}
            >
              {isLoading ? <span className="loading"></span> : 'Generate Summary'}
            </button>
            
            {summary && (
              <button
                className="btn btn-secondary"
                onClick={clearForm}
              >
                Clear Form
              </button>
            )}
          </div>
        </div>

        {summary && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Summary</h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Summary
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={updateSummary}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                className="form-input form-textarea"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Edit your summary here..."
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded border">
                <pre className="whitespace-pre-wrap text-gray-800">{summary}</pre>
              </div>
            )}
          </div>
        )}

        {summary && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Share Summary</h2>
            
            <div className="form-group">
              <label className="form-label">Recipient Email Addresses</label>
              <input
                type="text"
                className="form-input"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g., john@example.com, jane@example.com)"
              />
            </div>

            <button
              className="btn btn-success"
              onClick={shareSummary}
              disabled={!recipientEmails.trim()}
            >
              Share via Email
            </button>
          </div>
        )}

        <footer className="text-center text-gray-600 mt-8">
          <p>Powered by Groq AI • Built with React & Node.js</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
