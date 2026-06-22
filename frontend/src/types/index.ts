export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  saved: boolean;
  messages: Message[];
}
