import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDocFromServer, 
  FirestoreError 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const databaseId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-homecrew-4775f202-9317-4ddc-b447-e0426b1b8194';

// Initialize Firestore with long-polling to prevent proxy/iframe streaming WebSocket drops
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, databaseId);
  } catch (e) {
    return getFirestore(app, databaseId);
  }
})();

export const auth = getAuth(app);

// Standard Google Auth Provider for authentication (without restricted scopes)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Optional Gmail Provider for sending email notifications
export const gmailProvider = new GoogleAuthProvider();
gmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');

// Cache OAuth access token in-memory only (DO NOT store in localStorage)
let cachedOAuthAccessToken: string | null = null;

export const getCachedOAuthToken = (): string | null => {
  return cachedOAuthAccessToken;
};

export const setCachedOAuthToken = (token: string | null): void => {
  cachedOAuthAccessToken = token;
};

// Error Handler adhering to firebase-integration-rpc specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline; local cache active.');
    }
  }
}

// Google Sign In with Popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedOAuthToken(credential.accessToken);
    }
    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
      cancelled: false,
    };
  } catch (err: any) {
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/popup-blocked' ||
      String(err?.message).includes('popup-closed-by-user')
    ) {
      console.warn('Google sign-in popup was closed or blocked.');
      return {
        user: null,
        accessToken: null,
        cancelled: true,
      };
    }
    console.error('Sign-in error:', err);
    throw err;
  }
}

export async function signOutUser() {
  setCachedOAuthToken(null);
  await signOut(auth);
}
