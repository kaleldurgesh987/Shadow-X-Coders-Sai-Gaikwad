
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI using your Gemini API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Maps Grounding Endpoint using Gemini Interactions API
app.post('/api/ai/maps-grounding', async (req, res) => {
  try {
    const {
      prompt,
      latitude = 19.0760,
      longitude = 72.8777,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Prompt is required',
      });
    }

    const interaction: any = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
      tools: [
        {
          type: 'google_maps',
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      ],
    });

    const textParts: string[] = [];
    const groundingChunks: any[] = [];

    for (const step of interaction.steps || []) {
      if (step.type !== 'model_output') {
        continue;
      }

      for (const block of step.content || []) {
        if (block.type !== 'text') {
          continue;
        }

        if (block.text) {
          textParts.push(block.text);
        }

        for (const annotation of block.annotations || []) {
          if (annotation.type === 'place_citation') {
            groundingChunks.push({
              maps: {
                uri: annotation.url,
                title: annotation.name,
              },
            });
          }
        }
      }
    }

    const text = textParts.join('\n');

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    res.json({
      text,
      groundingChunks,
    });

  } catch (error: any) {
    console.error('Maps Grounding Error:', error);

    res.status(500).json({
      error: error?.message || 'Failed to generate Maps grounded response',
    });
  }
});

// Gmail Notification Endpoint via Google Workspace OAuth Token
app.post('/api/email/notify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing Authorization header with Google OAuth token',
      });
    }

    const { to, subject, htmlBody } = req.body;

    if (!to || !subject || !htmlBody) {
      return res.status(400).json({
        error: 'to, subject, and htmlBody are required',
      });
    }

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      htmlBody,
    ];

    const message = messageParts.join('\r\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmailRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    if (!gmailRes.ok) {
      const errData = await gmailRes.json();

      return res.status(gmailRes.status).json({
        error: errData,
      });
    }

    const data = await gmailRes.json();

    res.json({
      success: true,
      messageId: data.id,
    });

  } catch (err: any) {
    console.error('Gmail send error:', err);

    res.status(500).json({
      error: err?.message || 'Failed to send email via Gmail',
    });
  }
});

// WhatsApp Notifications and Click-to-Chat helper
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const {
      phoneNumber,
      message,
      type = 'booking_update',
    } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'phoneNumber and message are required',
      });
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    const clickToChatUrl =
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let apiDeliveryStatus = 'not_configured';

    if (token && phoneId) {
      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v20.0/${phoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanPhone,
              type: 'text',
              text: { body: message },
            }),
          }
        );

        if (waRes.ok) {
          apiDeliveryStatus = 'sent';
        } else {
          apiDeliveryStatus = 'failed';
        }

      } catch (e) {
        apiDeliveryStatus = 'failed';
      }
    }

    res.json({
      success: true,
      type,
      clickToChatUrl,
      apiDeliveryStatus,
      sentAt: new Date().toISOString(),
    });

  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to process WhatsApp request',
    });
  }
});

// Public config endpoint for client maps key
app.get('/api/config', (_req, res) => {
  res.json({
    mapsApiKey:
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '',
  });
});

// Mount Vite or static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `HomeCrew server is running on port ${PORT} in ${isProd ? 'production' : 'development'} mode`
    );
  });
}

startServer();
