// lib/types.ts
export type Lang = 'ko' | 'ja' | 'en' | 'zh';
export type Category = 'restaurant' | 'hotel' | 'tourist' | 'others';
export type SortType = 'latest' | 'popular' | 'comments';
export type ProjectSort = 'points' | 'deadline' | 'region';
export type TabType = 'members' | 'projects' | 'statistics' | 'export';

export interface User {
  id: string;
  nickname: string;
  name: string;
  email: string;
  phone: string;
  platform: string[];
  region: string;
  registrationDate: string;
  points: number;
  contribution: number;
}

export interface Project {
  id: number;
  category: Category;
  title: string;
  location: string;
  desc: string;
  points: number;
  deadline?: string;
  isFavorite?: boolean;
}

export interface Post {
  id: number;
  title: string;
  author: string;
  authorNickname: string;
  date: string;
  views: number;
  comments: number;
  content: string;
  image?: string; // base64 or URL
  board: 'free' | 'life';
}

export interface MyProject {
  id: number;
  projectName: string;
  date: string;
  points: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  resultUrl?: string;
}

export interface CommentItem {
  id: number;
  postId: number;
  board: 'free' | 'life';
  authorId: string;
  authorNickname: string;
  content: string;
  date: string;
}
