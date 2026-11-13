export interface BirthdayPhoto { id: string; src: string; alt: string; caption: string; objectPosition?: string }
export interface BirthdayConfig {
  recipientName: string; recipientHandle: string; birthdayDate: string | null; senderName: string;
  noteTitle: string; noteParagraphs: string[]; surpriseMessage: string; finalWish: string;
  heroPresentation: 'hybrid' | 'illustrated' | 'photo'; photos: BirthdayPhoto[];
}
