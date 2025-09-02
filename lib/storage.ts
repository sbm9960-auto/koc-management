// lib/storage.ts
import type { User, Project, Post, MyProject, CommentItem, Lang } from './types';

const PREFIX = 'koc_';

export const LS = {
  lang: `${PREFIX}lang`,
  isLoggedIn: `${PREFIX}isLoggedIn`,
  currentUser: `${PREFIX}currentUser`,
  users: `${PREFIX}users`,
  projects: `${PREFIX}projects`,
  postsFree: `${PREFIX}postsFree`,
  postsLife: `${PREFIX}postsLife`,
  myProjects: `${PREFIX}myProjects`,
  comments: `${PREFIX}comments`,
} as const;

export function getLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLS<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedIfEmpty() {
  // users
  const users = getLS<User[]>(LS.users, []);
  if (users.length === 0) {
    const seeded: User[] = [
      {
        id: 'admin',
        nickname: '관리자',
        name: '관리자',
        email: 'admin@koc.com',
        phone: '080-0000-0000',
        platform: ['네이버 블로그', '유튜브', '인스타그램'],
        region: '도쿄',
        registrationDate: '2024.01.01',
        points: 99999,
        contribution: 99999,
      },
    ];
    setLS(LS.users, seeded);
  }

  // projects
  const projects = getLS<Project[]>(LS.projects, []);
  if (projects.length === 0) {
    setLS(LS.projects, [
      { id: 1, category: 'restaurant', title: '도쿄 라멘집 체험', location: '도쿄', desc: '맛있는 라멘 체험', points: 1000, deadline: '2024.12.31' },
      { id: 2, category: 'hotel', title: '오사카 호텔 숙박', location: '오사카', desc: '호텔 숙박 체험', points: 2000, deadline: '2024.12.25' },
      { id: 3, category: 'tourist', title: '교토 전통 체험', location: '교토', desc: '전통 문화 체험', points: 1500, deadline: '2024.12.20' },
      { id: 4, category: 'restaurant', title: '도쿄 스시 오마카세', location: '도쿄', desc: '고급 스시 체험', points: 2500, deadline: '2024.12.15' },
      { id: 5, category: 'hotel', title: '교토 료칸 숙박', location: '교토', desc: '전통 료칸 체험', points: 3000, deadline: '2024.12.10' },
    ]);
  }

  // posts
  const free = getLS<Post[]>(LS.postsFree, []);
  if (free.length === 0) {
    setLS(LS.postsFree, [
      { id: 1, board: 'free', title: '오사카 맛집 추천해주세요!', author: 'user1', authorNickname: '여행러버', date: today(), views: 234, comments: 12, content: '오사카 여행 예정입니다.' },
      { id: 2, board: 'free', title: '도쿄 호텔 체험 후기', author: 'user2', authorNickname: '호텔마니아', date: today(-1), views: 156, comments: 8, content: '정말 좋았어요!' },
    ]);
  }

  const life = getLS<Post[]>(LS.postsLife, []);
  if (life.length === 0) {
    setLS(LS.postsLife, [
      { id: 1, board: 'life', title: '도쿄 월세 정보', author: 'user3', authorNickname: '도쿄살이', date: today(), views: 320, comments: 15, content: '도쿄 월세 정보 공유합니다.' },
    ]);
  }

  const comments = getLS<CommentItem[]>(LS.comments, []);
  if (comments.length === 0) {
    setLS(LS.comments, []);
  }

  const myProjects = getLS<MyProject[]>(LS.myProjects, []);
  if (myProjects.length === 0) setLS(LS.myProjects, []);
}

export function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
