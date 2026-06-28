import { LifeEventId } from "@/lib/constants";
import type { PublicProfileSettings } from "@/lib/public-profile";

export interface MockUser {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role: "MENTOR" | "SEEKER";
  gender?: "WOMAN" | "MAN" | "NON_BINARY";
  tagline: string;
  lifeEvents: LifeEventId[];
  yearsExperience?: number;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  availability?: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  bio?: string;
  location?: string;
  languages?: string[];
  matchScore?: number;
  matchExplanation?: string;
  matchedSignals?: string[];
  settings?: PublicProfileSettings;
}

export interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface MockConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  lifeEvent: LifeEventId;
}

export const MOCK_MENTORS: MockUser[] = [
  {
    id: "m1",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SarahChen&backgroundColor=b6e3f4",
    role: "MENTOR",
    gender: "WOMAN",
    tagline: "Turned divorce into my greatest growth chapter",
    lifeEvents: ["divorce", "mental-health", "fresh-start"],
    yearsExperience: 4,
    rating: 4.9,
    reviewCount: 127,
    isVerified: true,
    availability: "AVAILABLE",
    bio: "I went through a painful divorce after 12 years of marriage while raising two children. It shattered my world but also became the catalyst for deep self-discovery. I'm here to walk with you through the fog and into the light.",
    location: "San Francisco, CA",
    languages: ["English", "Mandarin"],
  },
  {
    id: "m2",
    name: "Marcus Williams",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusW&backgroundColor=c0aede",
    role: "MENTOR",
    gender: "MAN",
    tagline: "From redundancy to thriving entrepreneur",
    lifeEvents: ["job-loss", "financial", "fresh-start"],
    yearsExperience: 6,
    rating: 4.8,
    reviewCount: 89,
    isVerified: true,
    availability: "AVAILABLE",
    bio: "Being laid off at 42 with a family to support was terrifying. I spent months in dark uncertainty. Now I run a company I love. I know the exact steps, mindset shifts, and coping strategies that make the difference.",
    location: "Austin, TX",
    languages: ["English"],
  },
  {
    id: "m3",
    name: "Dr. Priya Nair",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PriyaN&backgroundColor=d1f2a5",
    role: "MENTOR",
    gender: "WOMAN",
    tagline: "Survived breast cancer. Now I help others face theirs.",
    lifeEvents: ["health-crisis", "mental-health"],
    yearsExperience: 7,
    rating: 5.0,
    reviewCount: 203,
    isVerified: true,
    availability: "BUSY",
    bio: "A Stage 3 diagnosis at 38 changed everything. The fear, the treatments, the identity shift — I lived it all. As a doctor and a survivor, I bring both clinical perspective and lived experience to those walking that same road.",
    location: "New York, NY",
    languages: ["English", "Hindi", "Tamil"],
  },
  {
    id: "m4",
    name: "James O'Brien",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JamesOB&backgroundColor=ffd5dc",
    role: "MENTOR",
    gender: "MAN",
    tagline: "5 years sober. Life is possible on the other side.",
    lifeEvents: ["addiction", "mental-health", "fresh-start"],
    yearsExperience: 5,
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    availability: "AVAILABLE",
    bio: "Addiction nearly took everything from me. Now I have everything I used to numb myself to escape. Recovery is the hardest and most rewarding thing I've ever done, and I want to be the hand that was extended to me when I needed it most.",
    location: "Chicago, IL",
    languages: ["English"],
  },
  {
    id: "m5",
    name: "Elena Vasquez",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ElenaV&backgroundColor=ffdfba",
    role: "MENTOR",
    gender: "WOMAN",
    tagline: "Rebuilt my life after moving continents alone",
    lifeEvents: ["relocation", "fresh-start", "mental-health"],
    yearsExperience: 3,
    rating: 4.8,
    reviewCount: 64,
    isVerified: true,
    availability: "AVAILABLE",
    bio: "I moved from Buenos Aires to London with two suitcases and a dream. The isolation, culture shock, and loneliness was overwhelming at first. Now I help others find their community and purpose in a new place.",
    location: "London, UK",
    languages: ["English", "Spanish"],
  },
  {
    id: "m6",
    name: "David Kim",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DavidK&backgroundColor=c9e4ca",
    role: "MENTOR",
    gender: "MAN",
    tagline: "Grief taught me how to truly live",
    lifeEvents: ["grief", "mental-health"],
    yearsExperience: 8,
    rating: 4.9,
    reviewCount: 178,
    isVerified: true,
    availability: "BUSY",
    bio: "I lost my wife to cancer when our kids were 3 and 6. The grief was incomprehensible. Eight years later, I can hold both the love and the loss. I'm a certified grief coach who knows that healing is not linear — and it is possible.",
    location: "Seattle, WA",
    languages: ["English", "Korean"],
  },
];

export const MOCK_CURRENT_USER: MockUser = {
  id: "u1",
  name: "Alex Rivera",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexR&backgroundColor=b6e3f4",
  role: "SEEKER",
  gender: "NON_BINARY",
  tagline: "Looking for guidance through a career transition",
  lifeEvents: ["job-loss", "mental-health"],
  location: "Denver, CO",
  languages: ["English", "Spanish"],
  settings: {
    general: {
      anonymousMode: false,
      displayNameMode: "full-name",
      allowCommunityProfile: true,
    },
  },
};

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: "c1",
    participantId: "m2",
    participantName: "Marcus Williams",
    participantAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusW&backgroundColor=c0aede",
    lastMessage: "That's a great reframe. Remember — uncertainty is where possibility lives.",
    lastMessageTime: "10m ago",
    unreadCount: 2,
    lifeEvent: "job-loss",
  },
  {
    id: "c2",
    participantId: "m1",
    participantName: "Sarah Chen",
    participantAvatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SarahChen&backgroundColor=b6e3f4",
    lastMessage: "Take the rest you need. We can continue whenever you're ready.",
    lastMessageTime: "2h ago",
    unreadCount: 0,
    lifeEvent: "mental-health",
  },
];

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: "msg1",
    senderId: "u1",
    content: "Hi Marcus, I was laid off last month and honestly I'm struggling to stay positive. Everyone keeps saying 'it's an opportunity' but it just feels like the rug was pulled out from under me.",
    timestamp: "Yesterday 3:14 PM",
    read: true,
  },
  {
    id: "msg2",
    senderId: "m2",
    content: "I hear you. And honestly? Telling someone who just lost their job 'it's an opportunity' is one of the unhelpful things people say. Let the grief be grief first. I was a wreck for 2 months after my layoff.",
    timestamp: "Yesterday 3:22 PM",
    read: true,
  },
  {
    id: "msg3",
    senderId: "u1",
    content: "That actually really helps to hear. Can I ask — how long did it take before things started to feel okay again?",
    timestamp: "Yesterday 4:05 PM",
    read: true,
  },
  {
    id: "msg4",
    senderId: "m2",
    content: "Honest answer: about 6 weeks before I felt human again, 4 months before I felt excited. But the key shift was stopping the job hunt for 2 weeks and asking myself what I actually wanted — not what seemed 'safe'. What did your job mean to you beyond the paycheck?",
    timestamp: "Yesterday 4:18 PM",
    read: true,
  },
  {
    id: "msg5",
    senderId: "u1",
    content: "Wow I hadn't thought about it that way. I think... it gave me structure and identity. Without it I feel kind of invisible.",
    timestamp: "10:02 AM",
    read: true,
  },
  {
    id: "msg6",
    senderId: "m2",
    content: "That's a great reframe. Remember — uncertainty is where possibility lives.",
    timestamp: "10:15 AM",
    read: false,
  },
];
