// Authentication Middleware
// Built by Team ShadowX Coders

import { adminAuth, adminDb } from '../config/firebase.admin.js';

/**
 * Verifies Firebase ID token from Authorization header.
 * Sets req.user = { uid, email, name, role }
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!adminAuth) {
      return res.status(503).json({ 
        error: 'Auth service not configured. Set Firebase Admin credentials.' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Fetch role from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data().role : null;

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role,
    };
    
    next();
  } catch (err) {
    console.error('[Auth Middleware] Token verification failed:', err.code);
    
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Requires the user to have the 'customer' role.
 */
export const requireCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ error: 'Customer access required' });
  }
  next();
};

/**
 * Requires the user to have the 'worker' role.
 */
export const requireWorker = (req, res, next) => {
  if (req.user?.role !== 'worker') {
    return res.status(403).json({ error: 'Worker access required' });
  }
  next();
};

/**
 * Requires admin access (checks admins Firestore collection).
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!adminDb) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
    
    const adminDoc = await adminDb.collection('admins').doc(req.user.uid).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.isAdmin = true;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
