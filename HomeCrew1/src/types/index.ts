export type UserRole = 'customer' | 'worker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  profileImage?: string;
  role: UserRole;
  location?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage?: 'en' | 'hi' | 'mr';
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkerProfile {
  id: string;
  workerId: string;
  name: string;
  email?: string;
  skills: string[];
  services: string[];
  experienceYears: number;
  hourlyRate: number;
  fixedRate?: number;
  availability: boolean;
  workingArea: string;
  location: string;
  latitude: number;
  longitude: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  phoneNumber: string;
  whatsappNumber: string;
  profileImage: string;
  bio: string;
  idProofType?: string;
  createdAt: string;
}

export type JobStatus = 
  | 'pending' 
  | 'negotiating' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  workerWhatsapp?: string;
  service: string;
  description: string;
  location: string;
  customerLat?: number;
  customerLng?: number;
  workerLat?: number;
  workerLng?: number;
  scheduledAt: string;
  isImmediate: boolean;
  status: JobStatus;
  initialPrice: number;
  finalPrice?: number;
  etaMinutes?: number;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferHistoryItem {
  senderId: string;
  senderRole: 'customer' | 'worker';
  amount: number;
  note?: string;
  timestamp: string;
}

export interface Offer {
  id: string;
  jobId: string;
  customerId: string;
  workerId: string;
  currentAmount: number;
  lastUpdatedBy: 'customer' | 'worker';
  status: 'pending' | 'countered' | 'accepted' | 'rejected';
  history: OfferHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string;
  readStatus: boolean;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'offer' | 'status' | 'system';
  relatedJobId?: string;
  isRead: boolean;
  createdAt: string;
}
