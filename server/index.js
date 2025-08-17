const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Groq } = require('groq-sdk');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Groq (optional for testing)
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} else {
  console.log('⚠️  Groq API key not configured. AI summarization will not work.');
  console.log('   To enable AI features, set GROQ_API_KEY in your .env file');
}

// Initialize SQLite database
const db = new sqlite3.Database('./meetings.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transcript TEXT,
    prompt TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS shared_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER,
    recipient_email TEXT,
    shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
  )`);
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Upload transcript file
app.post('/api/upload-transcript', upload.single('transcript'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (!req.file.mimetype.includes('text/') && !req.file.originalname.endsWith('.txt')) {
      return res.status(400).json({ error: 'Only text files are allowed' });
    }

    // Convert buffer to string
    const transcript = req.file.buffer.toString('utf-8');
    
    res.json({
      transcript,
      filename: req.file.originalname,
      message: 'Transcript uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading transcript:', error);
    res.status(500).json({ error: 'Failed to upload transcript' });
  }
});

// Generate summary from transcript and prompt
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { transcript, prompt } = req.body;
    
    if (!transcript || !prompt) {
      return res.status(400).json({ error: 'Transcript and prompt are required' });
    }

    // Check if Groq is available
    if (!groq) {
      return res.status(503).json({ 
        error: 'AI service not available. Please configure GROQ_API_KEY in your environment variables.',
        demo: true
      });
    }

    // Create system prompt
    const systemPrompt = `You are an expert meeting summarizer. Generate a structured summary based on the user's instructions. 
    Always maintain professionalism and clarity. Format your response appropriately based on the user's request.`;

    // Create user prompt
    const userPrompt = `Transcript: ${transcript}\n\nInstructions: ${prompt}\n\nPlease provide a structured summary based on these instructions.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 2048,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    // Save to database
    const stmt = db.prepare('INSERT INTO meetings (transcript, prompt, summary) VALUES (?, ?, ?)');
    stmt.run(transcript, prompt, summary, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save meeting' });
      }
      
      res.json({
        summary,
        meetingId: this.lastID,
        message: 'Summary generated successfully'
      });
    });
    stmt.finalize();

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get meeting by ID
app.get('/api/meeting/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM meetings WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(row);
  });
});

// Update summary
app.put('/api/meeting/:id/summary', (req, res) => {
  const { id } = req.params;
  const { summary } = req.body;
  
  if (!summary) {
    return res.status(400).json({ error: 'Summary is required' });
  }
  
  db.run('UPDATE meetings SET summary = ? WHERE id = ?', [summary, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update summary' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ message: 'Summary updated successfully' });
  });
});

// Share summary via email
app.post('/api/share-summary', async (req, res) => {
  try {
    const { meetingId, recipientEmails, summary } = req.body;
    
    if (!meetingId || !recipientEmails || !summary) {
      return res.status(400).json({ error: 'Meeting ID, recipient emails, and summary are required' });
    }

    // Get meeting details
    db.get('SELECT * FROM meetings WHERE id = ?', [meetingId], async (err, meeting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

          // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_PASS === 'your_gmail_app_password_here') {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in your environment variables.',
        demo: true
      });
    }

    // Configure email transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

      const emailArray = recipientEmails.split(',').map(email => email.trim());
      
      // Send emails to all recipients
      for (const email of emailArray) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Meeting Summary Shared',
          html: `
            <h2>Meeting Summary</h2>
            <p><strong>Original Prompt:</strong> ${meeting.prompt}</p>
            <hr>
            <div style="white-space: pre-wrap;">${summary}</div>
            <hr>
            <p><em>This summary was generated using AI technology.</em></p>
          `
        };

        await transporter.sendMail(mailOptions);
        
        // Save sharing record
        db.run('INSERT INTO shared_summaries (meeting_id, recipient_email) VALUES (?, ?)', 
          [meetingId, email]);
      }

      res.json({ message: 'Summary shared successfully' });
    });

  } catch (error) {
    console.error('Error sharing summary:', error);
    res.status(500).json({ error: 'Failed to share summary' });
  }
});

// Get all meetings
app.get('/api/meetings', (req, res) => {
  db.all('SELECT id, prompt, created_at FROM meetings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
