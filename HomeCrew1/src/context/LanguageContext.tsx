import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

const TRANSLATIONS: Translations = {
  tagline: {
    en: 'Professional Hands in your Services',
    hi: 'आपकी सेवा में कुशल और विश्वसनीय हाथ',
    mr: 'तुमच्या सेवेत तत्पर आणि कुशल हात',
  },
  missionBanner: {
    en: 'Connecting you with trusted local blue-collar professionals within 30 minutes',
    hi: '३० मिनिटांत विश्वासार्ह स्थानिक कारागिरांशी जोडतो',
    mr: '३० मिनिटांत विश्वासू स्थानिक कामगारांशी संपर्क जोडून देतो',
  },
  findWorkers: {
    en: 'Find Nearby Workers',
    hi: 'जवळपासचे कारागीर शोधा',
    mr: 'जवळचे कामगार शोधा',
  },
  postJob: {
    en: 'Post a Job',
    hi: 'काम पोस्ट करा',
    mr: 'काम पोस्ट करा',
  },
  activeJobs: {
    en: 'Active Bookings',
    hi: 'सक्रिय बुकिंंग्स',
    mr: 'सक्रिय बुकिंंग्स',
  },
  aiAssistant: {
    en: 'Maps AI Assistant',
    hi: 'नकाशा AI सहाय्यक',
    mr: 'नकाशा AI सहाय्यक',
  },
  adminDashboard: {
    en: 'Admin Panel',
    hi: 'प्रशासक पॅनल',
    mr: 'प्रशासक पॅनेल',
  },
  signIn: {
    en: 'Sign In',
    hi: 'साइन इन',
    mr: 'साइन इन करा',
  },
  signOut: {
    en: 'Sign Out',
    hi: 'साइन आउट',
    mr: 'साइन आउट',
  },
  switchRole: {
    en: 'Switch Role',
    hi: 'भूमिका बदला',
    mr: 'भूमिका बदला',
  },
  customerRole: {
    en: 'Customer',
    hi: 'ग्राहक',
    mr: 'ग्राहक',
  },
  workerRole: {
    en: 'Worker / Professional',
    hi: 'कारागीर / कामगार',
    mr: 'कारागीर / कामगार',
  },
  sosAlert: {
    en: 'Emergency SOS',
    hi: 'आपत्कालीन SOS',
    mr: 'आपत्कालीन SOS',
  },
  verifiedBadge: {
    en: 'Verified Worker',
    hi: 'सत्यापित कारागीर',
    mr: 'सत्यापित कामगार',
  },
  negotiatePrice: {
    en: 'Negotiate Price',
    hi: 'किंमत वाटाघाटी करा',
    mr: 'किंमतीवर चर्चा करा',
  },
  instantBook: {
    en: 'Instant Book',
    hi: 'त्वरित बुक करा',
    mr: 'त्वरित बुक करा',
  },
  chatOnWhatsapp: {
    en: 'WhatsApp Direct',
    hi: 'व्हॉट्सॲपवर चॅट करा',
    mr: 'व्हॉट्सॲपवर संपर्क करा',
  },
  builtBy: {
    en: 'Built by Team ShadowX Coders',
    hi: 'टीम ShadowX Coders द्वारे निर्मित',
    mr: 'टीम ShadowX Coders यांनी विकसित केले',
  },
  within30Min: {
    en: 'Within 30 Minutes',
    hi: '३० मिनिटांत पोहोचणे',
    mr: '३० मिनिटांच्या आत',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('homecrew_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('homecrew_lang', lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
