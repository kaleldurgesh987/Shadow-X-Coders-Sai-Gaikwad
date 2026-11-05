import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import axios from 'axios';

const router = Router();

const WHATSAPP_CONFIGURED = !!(
  process.env.WHATSAPP_ACCESS_TOKEN &&
  process.env.WHATSAPP_PHONE_NUMBER_ID
);

// POST /api/whatsapp/send — send WhatsApp notification (backend only)
router.post('/send', verifyToken, async (req, res) => {
  if (!WHATSAPP_CONFIGURED) {
    return res.status(503).json({ 
      error: 'WhatsApp Business API not configured',
      fallback: 'Use Click-to-Chat instead',
      configured: false,
    });
  }

  try {
    const { to, templateName, components } = req.body;
    
    if (!to || !templateName) {
      return res.status(400).json({ error: 'to and templateName required' });
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''), // digits only
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: components || [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ 
      message: 'WhatsApp notification sent', 
      messageId: response.data.messages?.[0]?.id,
      configured: true,
    });
  } catch (err) {
    console.error('[WhatsApp Send]', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp notification',
      details: err.response?.data?.error?.message,
    });
  }
});

// GET /api/whatsapp/webhook — verify webhook (WhatsApp Business API)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
});

// POST /api/whatsapp/webhook — receive WhatsApp messages
router.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    // Process incoming messages
    body.entry?.forEach(entry => {
      entry.changes?.forEach(change => {
        const messages = change.value?.messages;
        if (messages) {
          messages.forEach(msg => {
            console.log('[WhatsApp Incoming]', msg.from, msg.text?.body);
            // TODO: Handle incoming messages (e.g., status updates)
          });
        }
      });
    });
    res.status(200).json({ status: 'EVENT_RECEIVED' });
  } else {
    res.status(404).json({ error: 'Not a WhatsApp event' });
  }
});

export default router;
