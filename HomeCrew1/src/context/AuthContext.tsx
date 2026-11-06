import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signOutUser, 
  getCachedOAuthToken,
  setCachedOAuthToken,
  handleFirestoreError,
  OperationType,
  testConnection
} from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  oauthAccessToken: string | null;
  loginWithGoogle: () => Promise<boolean>;
  loginWithPhone: (phone: string, role: UserRole, name: string) => Promise<void>;
  loginWithPhoneDemo: (phone: string, role: UserRole, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  oauthAccessToken: null,
  loginWithGoogle: async () => false,
  loginWithPhone: async () => {},
  loginWithPhoneDemo: async () => {},
  logout: async () => {},
  updateRole: async () => {},
  updateProfileDetails: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [oauthAccessToken, setOauthAccessToken] = useState<string | null>(null);

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // Check if default admin email
            const isAdmin = user.email === 'bushrashaikh2806@gmail.com';
            const initialRole: UserRole = isAdmin ? 'admin' : 'customer';

            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'HomeCrew Member',
              email: user.email || '',
              phoneNumber: user.phoneNumber || '+919820098200',
              whatsappNumber: user.phoneNumber || '+919820098200',
              profileImage: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              role: initialRole,
              location: 'Mumbai, Maharashtra',
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching/setting user profile:', err);
          // Fallback local profile if offline
          setUserProfile({
            uid: user.uid,
            name: user.displayName || 'HomeCrew Member',
            email: user.email || '',
            role: user.email === 'bushrashaikh2806@gmail.com' ? 'admin' : 'customer',
            phoneNumber: '+919820098200',
            whatsappNumber: '+919820098200',
            location: 'Mumbai, Maharashtra',
          });
        }
      } else {
        setUserProfile(null);
        setCachedOAuthToken(null);
        setOauthAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.cancelled || !res.user) {
        return false;
      }
      setCurrentUser(res.user);
      if (res.accessToken) {
        setOauthAccessToken(res.accessToken);
      }
      return true;
    } catch (err) {
      console.error('Failed to log in with Google:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phoneNumber: string, role: UserRole, name: string) => {
    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const uid = `phone_${cleanPhone}`;
      const profile: UserProfile = {
        uid,
        name: name || 'HomeCrew Member',
        email: `${cleanPhone}@homecrew.local`,
        phoneNumber,
        whatsappNumber: phoneNumber,
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role,
        location: 'Mumbai, Maharashtra',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', uid), {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.warn('Saved profile locally or connection offline');
      }

      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhoneDemo = loginWithPhone;

  const logout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setOauthAccessToken(null);
  };

  const updateRole = async (newRole: UserRole) => {
    if (!userProfile) return;
    const updated = { ...userProfile, role: newRole, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { role: newRole, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...details, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { ...details, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        oauthAccessToken: oauthAccessToken || getCachedOAuthToken(),
        loginWithGoogle,
        loginWithPhone,
        loginWithPhoneDemo,
        logout,
        updateRole,
        updateProfileDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
