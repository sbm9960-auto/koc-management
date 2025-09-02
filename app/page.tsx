'use client';

import React, { useEffect, useState } from 'react';

/* =========================
   타입 정의
========================= */
type Lang = 'ko' | 'ja' | 'en';
type Category = 'restaurant' | 'hotel' | 'tourist' | 'others';
type SortType = 'latest' | 'popular' | 'comments';
type ProjectSort = 'points' | 'deadline' | 'region';
type TabType = 'members' | 'projects' | 'statistics' | 'export';

interface User {
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
  role?: 'user' | 'admin';
}

interface Project {
  id: number;
  category: Category;
  title: string; // 기본(ko) 표시용
  location: string;
  desc: string;
  points: number;
  deadline?: string;
  isFavorite?: boolean;
  image?: string;
  // 다국어 세부 내용
  titleI18n?: Partial<Record<Lang, string>>;
  descI18n?: Partial<Record<Lang, string>>;
  locationI18n?: Partial<Record<Lang, string>>;
}

interface CommentItem {
  id: number;
  authorId: string;
  authorNickname: string;
  date: string;
  text: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  authorNickname: string;
  date: string;
  views: number;
  comments: number; // count
  content: string;
  image?: string;
  board: 'free' | 'life';
  commentList?: CommentItem[];
}

interface MyProject {
  id: number;
  userId: string;
  projectName: string;
  date: string; // YYYY.MM.DD
  time?: string; // HH:mm
  points: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  resultUrl?: string;
}

/* =========================
   번역 사전
========================= */
const translations: Record<Lang, any> = {
  ko: {
    systemTitle: 'KOC 관리 시스템',
    points: '포인트',
    loginPrompt: '로그인해주세요',
    login: '로그인',
    logout: '로그아웃',
    mainMenu: '메인 메뉴',
    home: '홈',
    projectList: '안건 목록',
    myPage: '마이페이지',
    community: '커뮤니티',
    freeBoard: '자유게시판',
    lifeBoard: '일본 생활 질문',
    ranking: '랭킹',
    management: '관리',
    admin: '관리자',
    welcome: '환영합니다!',
    totalPoints: '총 포인트',
    completedProjects: '완료한 안건',
    contribution: '공헌도',
    overallRanking: '전체 랭킹',
    popularProjects: '인기 안건',
    trendingPosts: '주간 트렌딩',
    apply: '신청하기',
    yen: '엔',
    cases: '건',
    rank: '위',
    allProjects: '전체 안건 목록',
    all: '전체',
    restaurant: '음식점',
    hotel: '호텔',
    tourist: '관광지',
    others: '기타',
    filterSort: '필터/정렬',
    sortByPoints: '포인트 높은 순',
    sortByDeadline: '마감 임박순',
    filterByRegion: '지역별',
    addFavorite: '즐겨찾기',
    removeFavorite: '즐겨찾기 해제',
    writePost: '글쓰기',
    titleLabel: '제목',
    contentLabel: '내용',
    imageUpload: '이미지 업로드',
    postSubmit: '등록',
    cancel: '취소',
    views: '조회',
    comments: '댓글',
    search: '검색',
    searchPlaceholder: '검색어를 입력하세요',
    sortLatest: '최신순',
    sortPopular: '인기순',
    sortComments: '댓글순',
    prevPage: '이전',
    nextPage: '다음',
    contributionRanking: '공헌도 랭킹',
    rankingHeader: '순위',
    nickname: '닉네임',
    nicknameLabel: '닉네임',
    checkDuplicate: '중복확인',
    nicknameAvailable: '사용 가능한 닉네임입니다',
    nicknameTaken: '이미 사용중인 닉네임입니다',
    enterNickname: '닉네임을 입력하세요',
    contributionScore: '공헌도',
    completedCases: '완료 안건',
    earnedPoints: '획득 포인트',
    myPoints: '보유 포인트',
    myActivities: '나의 활동 내역',
    myProjects: '나의 안건 관리',
    submitResult: '결과물 제출',
    resultUrl: '결과물 URL',
    submitUrl: 'URL 제출',
    pendingReview: '검토 대기중',
    approved: '승인됨',
    rejected: '거절됨',
    pending: '진행중',
    submitted: '제출됨',
    requestRefund: '포인트 환급 신청',
    signup: '회원가입',
    id: '아이디',
    password: '비밀번호',
    passwordConfirm: '비밀번호 확인',
    email: '이메일',
    phone: '전화번호',
    name: '이름',
    activityPlatform: '활동 매체 선택',
    naverBlog: '네이버 블로그',
    youtube: '유튜브',
    instagram: '인스타그램',
    residence: '거주 지역',
    selectOption: '선택하세요',
    tokyo: '도쿄',
    osaka: '오사카',
    kyoto: '교토',
    privacyAgree: '개인정보 수집 및 이용에 동의합니다',
    termsAgree: '서비스 이용약관에 동의합니다',
    memberManagement: '회원 관리',
    projectManagement: '안건 관리',
    statistics: '통계',
    exportData: '데이터 내보내기',
    registrationDate: '가입일',
    manage: '관리',
    detail: '상세',
    deductPoints: '포인트 차감',
    approveResult: '결과 승인',
    rejectResult: '결과 거절',
    exportToSpreadsheet: '스프레드시트로 내보내기',
    totalMembers: '전체 회원수',
    activeProjects: '진행중 안건',
    monthlyRevenue: '월 매출',
    enterID: '아이디를 입력하세요',
    enterPassword: '비밀번호를 입력하세요',
    reenterPassword: '비밀번호를 다시 입력하세요',
    loginRequired: '로그인이 필요합니다!',
    urlSubmitted: 'URL이 제출되었습니다. 관리자 검토 후 포인트가 지급됩니다.',
    pointsDeducted: '포인트가 차감되었습니다.',
    signupComplete: '회원가입이 완료되었습니다! 로그인되었습니다.',
    projectApply: '안건 신청',
    pickDate: '희망 날짜 선택',
    pickTime: '희망 시간',
    confirmApply: '신청',
    applyDone: '신청 완료!',
    postManage: '게시글 관리',
    edit: '수정',
    remove: '삭제',
    save: '저장',
    myPosts: '나의 게시글',
    addComment: '댓글 달기',
    deleteComment: '댓글 삭제',
    year: '년',
    month: '월',
    projectImage: '안건 이미지',
    addProject: '안건 등록',
    projectCategory: '카테고리',
    projectTitle: '안건명',
    projectLocation: '지역',
    projectDesc: '설명',
    projectPoints: '포인트',
    projectDeadline: '마감일(YYYY.MM.DD)',
    submit: '등록',
  },
  ja: {
    systemTitle: 'KOC管理システム',
    points: 'ポイント',
    loginPrompt: 'ログインしてください',
    login: 'ログイン',
    logout: 'ログアウト',
    mainMenu: 'メインメニュー',
    home: 'ホーム',
    projectList: '案件リスト',
    myPage: 'マイページ',
    community: 'コミュニティ',
    freeBoard: '掲示板',
    lifeBoard: '日本生活Q&A',
    ranking: 'ランキング',
    management: '管理',
    admin: '管理者',
    welcome: 'ようこそ！',
    totalPoints: '総ポイント',
    completedProjects: '完了案件',
    contribution: '貢献度',
    overallRanking: '全体ランキング',
    popularProjects: '人気案件',
    trendingPosts: '週間トレンド',
    apply: '申請',
    yen: '円',
    cases: '件',
    rank: '位',
    allProjects: '全案件リスト',
    all: '全て',
    restaurant: '飲食店',
    hotel: 'ホテル',
    tourist: '観光地',
    others: 'その他',
    filterSort: 'フィルター/ソート',
    sortByPoints: 'ポイント高い順',
    sortByDeadline: '締切間近順',
    filterByRegion: '地域別',
    addFavorite: 'お気に入り',
    removeFavorite: 'お気に入り解除',
    writePost: '投稿',
    titleLabel: 'タイトル',
    contentLabel: '内容',
    imageUpload: '画像アップロード',
    postSubmit: '登録',
    cancel: 'キャンセル',
    views: '閲覧',
    comments: 'コメント',
    search: '検索',
    searchPlaceholder: '検索ワードを入力',
    sortLatest: '最新順',
    sortPopular: '人気順',
    sortComments: 'コメント順',
    prevPage: '前へ',
    nextPage: '次へ',
    contributionRanking: '貢献度ランキング',
    rankingHeader: '順位',
    nickname: 'ニックネーム',
    nicknameLabel: 'ニックネーム',
    checkDuplicate: '重複確認',
    nicknameAvailable: '使用可能なニックネームです',
    nicknameTaken: '既に使用中のニックネームです',
    enterNickname: 'ニックネームを入力',
    contributionScore: '貢献度',
    completedCases: '完了案件',
    earnedPoints: '獲得ポイント',
    myPoints: '保有ポイント',
    myActivities: '活動履歴',
    myProjects: '案件管理',
    submitResult: '結果提出',
    resultUrl: '結果URL',
    submitUrl: 'URL提出',
    pendingReview: '審査待ち',
    approved: '承認済み',
    rejected: '拒否',
    pending: '進行中',
    submitted: '提出済み',
    requestRefund: 'ポイント換金申請',
    signup: '会員登録',
    id: 'ID',
    password: 'パスワード',
    passwordConfirm: 'パスワード確認',
    email: 'メール',
    phone: '電話番号',
    name: '名前',
    activityPlatform: '活動媒体選択',
    naverBlog: 'ネイバーブログ',
    youtube: 'YouTube',
    instagram: 'Instagram',
    residence: '居住地域',
    selectOption: '選択してください',
    tokyo: '東京',
    osaka: '大阪',
    kyoto: '京都',
    privacyAgree: '個人情報の収集・利用に同意します',
    termsAgree: 'サービス利用規約に同意します',
    memberManagement: '会員管理',
    projectManagement: '案件管理',
    statistics: '統計',
    exportData: 'データエクスポート',
    registrationDate: '登録日',
    manage: '管理',
    detail: '詳細',
    deductPoints: 'ポイント減算',
    approveResult: '結果承認',
    rejectResult: '結果拒否',
    exportToSpreadsheet: 'スプレッドシートへエクスポート',
    totalMembers: '全会員数',
    activeProjects: '進行中案件',
    monthlyRevenue: '月売上',
    enterID: 'IDを入力',
    enterPassword: 'パスワードを入力',
    reenterPassword: 'パスワード再入力',
    loginRequired: 'ログインが必要です！',
    urlSubmitted: 'URLが提出されました。管理者レビュー後ポイントが支給されます。',
    pointsDeducted: 'ポイントが減算されました。',
    signupComplete: '会員登録完了！ログインしました。',
    projectApply: '案件申請',
    pickDate: '希望日選択',
    pickTime: '希望時間',
    confirmApply: '申請',
    applyDone: '申請完了！',
    postManage: '投稿管理',
    edit: '編集',
    remove: '削除',
    save: '保存',
    myPosts: '自分の投稿',
    addComment: 'コメントする',
    deleteComment: 'コメント削除',
    year: '年',
    month: '月',
    projectImage: '案件画像',
    addProject: '案件登録',
    projectCategory: 'カテゴリ',
    projectTitle: '案件名',
    projectLocation: '地域',
    projectDesc: '説明',
    projectPoints: 'ポイント',
    projectDeadline: '締切(YYYY.MM.DD)',
    submit: '登録',
  },
  en: {
    systemTitle: 'KOC Management System',
    points: 'Points',
    loginPrompt: 'Please login',
    login: 'Login',
    logout: 'Logout',
    mainMenu: 'Main Menu',
    home: 'Home',
    projectList: 'Projects',
    myPage: 'My Page',
    community: 'Community',
    freeBoard: 'Board',
    lifeBoard: 'Japan Life Q&A',
    ranking: 'Ranking',
    management: 'Management',
    admin: 'Admin',
    welcome: 'Welcome!',
    totalPoints: 'Total Points',
    completedProjects: 'Completed',
    contribution: 'Contribution',
    overallRanking: 'Overall Rank',
    popularProjects: 'Popular Projects',
    trendingPosts: 'Weekly Trending',
    apply: 'Apply',
    yen: 'yen',
    cases: 'cases',
    rank: 'th',
    allProjects: 'All Projects',
    all: 'All',
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    tourist: 'Tourist',
    others: 'Others',
    filterSort: 'Filter/Sort',
    sortByPoints: 'Highest Points',
    sortByDeadline: 'Deadline Soon',
    filterByRegion: 'By Region',
    addFavorite: 'Add Favorite',
    removeFavorite: 'Remove Favorite',
    writePost: 'Write',
    titleLabel: 'Title',
    contentLabel: 'Content',
    imageUpload: 'Upload Image',
    postSubmit: 'Post',
    cancel: 'Cancel',
    views: 'Views',
    comments: 'Comments',
    search: 'Search',
    searchPlaceholder: 'Enter search term',
    sortLatest: 'Latest',
    sortPopular: 'Popular',
    sortComments: 'Most Comments',
    prevPage: 'Previous',
    nextPage: 'Next',
    contributionRanking: 'Contribution Ranking',
    rankingHeader: 'Rank',
    nickname: 'Nickname',
    nicknameLabel: 'Nickname',
    checkDuplicate: 'Check Duplicate',
    nicknameAvailable: 'Nickname is available',
    nicknameTaken: 'Nickname is already taken',
    enterNickname: 'Enter nickname',
    contributionScore: 'Contribution',
    completedCases: 'Completed',
    earnedPoints: 'Points Earned',
    myPoints: 'My Points',
    myActivities: 'My Activities',
    myProjects: 'Project Management',
    submitResult: 'Submit Result',
    resultUrl: 'Result URL',
    submitUrl: 'Submit URL',
    pendingReview: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    submitted: 'Submitted',
    requestRefund: 'Request Exchange',
    signup: 'Sign Up',
    id: 'ID',
    password: 'Password',
    passwordConfirm: 'Confirm Password',
    email: 'Email',
    phone: 'Phone',
    name: 'Name',
    activityPlatform: 'Activity Platform',
    naverBlog: 'Naver Blog',
    youtube: 'YouTube',
    instagram: 'Instagram',
    residence: 'Residence',
    selectOption: 'Select',
    tokyo: 'Tokyo',
    osaka: 'Osaka',
    kyoto: 'Kyoto',
    privacyAgree: 'I agree to the collection and use of personal information',
    termsAgree: 'I agree to the terms of service',
    memberManagement: 'Member Management',
    projectManagement: 'Project Management',
    statistics: 'Statistics',
    exportData: 'Export Data',
    registrationDate: 'Registration Date',
    manage: 'Manage',
    detail: 'Detail',
    deductPoints: 'Deduct Points',
    approveResult: 'Approve Result',
    rejectResult: 'Reject Result',
    exportToSpreadsheet: 'Export to Spreadsheet',
    totalMembers: 'Total Members',
    activeProjects: 'Active Projects',
    monthlyRevenue: 'Monthly Revenue',
    enterID: 'Enter ID',
    enterPassword: 'Enter password',
    reenterPassword: 'Re-enter password',
    loginRequired: 'Login required!',
    urlSubmitted: 'URL submitted. Points will be awarded after admin review.',
    pointsDeducted: 'Points deducted.',
    signupComplete: 'Registration completed! You are logged in.',
    projectApply: 'Project Application',
    pickDate: 'Pick a date',
    pickTime: 'Pick a time',
    confirmApply: 'Apply',
    applyDone: 'Applied!',
    postManage: 'Post Management',
    edit: 'Edit',
    remove: 'Delete',
    save: 'Save',
    myPosts: 'My Posts',
    addComment: 'Add Comment',
    deleteComment: 'Delete Comment',
    year: 'Year',
    month: 'Month',
    projectImage: 'Project Image',
    addProject: 'Create Project',
    projectCategory: 'Category',
    projectTitle: 'Title',
    projectLocation: 'Location',
    projectDesc: 'Description',
    projectPoints: 'Points',
    projectDeadline: 'Deadline (YYYY.MM.DD)',
    submit: 'Submit',
  }
};

/* =========================
   유틸
========================= */
const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const isWithinWeek = (dateStr: string) => {
  const postDate = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return postDate >= weekAgo;
};

// 다국어 텍스트 선택
const pickI18n = (lang: Lang, base: string, map?: Partial<Record<Lang, string>>) =>
  (map && map[lang]) || base;

/* =========================
   컴포넌트
========================= */
export default function KOCManagementSystem() {
  const [language, setLanguage] = useState<Lang>('ko');
  const t = translations[language];

  // 로그인/유저
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 메뉴
  const [activeMenu, setActiveMenu] = useState<string>('home');

  // 가입/로그인
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState<'none' | 'available' | 'taken'>('none');

  // 저장소 키
  const LS = {
    users: 'koc_users',
    postsFree: 'koc_free_posts',
    postsLife: 'koc_life_posts',
    myProjects: 'koc_my_projects',
    lang: 'koc_lang',
    currentUserId: 'koc_current_user_id',
    isAdmin: 'koc_is_admin',
    isLoggedIn: 'koc_is_logged_in',
    projects: 'koc_projects',
  };

  // 초기 유저
  const [users, setUsers] = useState<User[]>([
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
      role: 'admin',
    },
  ]);

  // 프로젝트
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      category: 'restaurant',
      title: '도쿄 라멘집 체험',
      location: '도쿄',
      desc: '맛있는 라멘 체험',
      points: 1000,
      deadline: '2024.12.31',
      image: '',
      titleI18n: {
        ja: '東京ラーメン店体験',
        en: 'Tokyo Ramen Shop Experience',
      },
      descI18n: {
        ja: '美味しいラーメンを体験',
        en: 'Taste delicious ramen',
      },
      locationI18n: { ja: '東京', en: 'Tokyo' },
    },
    {
      id: 2,
      category: 'hotel',
      title: '오사카 호텔 숙박',
      location: '오사카',
      desc: '호텔 숙박 체험',
      points: 2000,
      deadline: '2024.12.25',
      image: '',
      titleI18n: { ja: '大阪ホテル宿泊', en: 'Osaka Hotel Stay' },
      descI18n: { ja: 'ホテル宿泊体験', en: 'Hotel stay experience' },
      locationI18n: { ja: '大阪', en: 'Osaka' },
    },
    {
      id: 3,
      category: 'tourist',
      title: '교토 전통 체험',
      location: '교토',
      desc: '전통 문화 체험',
      points: 1500,
      deadline: '2024.12.20',
      image: '',
      titleI18n: { ja: '京都 伝統体験', en: 'Kyoto Traditional Experience' },
      descI18n: { ja: '伝統文化の体験', en: 'Traditional culture experience' },
      locationI18n: { ja: '京都', en: 'Kyoto' },
    },
    {
      id: 4,
      category: 'restaurant',
      title: '도쿄 스시 오마카세',
      location: '도쿄',
      desc: '고급 스시 체험',
      points: 2500,
      deadline: '2024.12.15',
      image: '',
      titleI18n: { ja: '東京 寿司おまかせ', en: 'Tokyo Sushi Omakase' },
      descI18n: { ja: '高級寿司体験', en: 'Premium sushi experience' },
      locationI18n: { ja: '東京', en: 'Tokyo' },
    },
    {
      id: 5,
      category: 'hotel',
      title: '교토 료칸 숙박',
      location: '교토',
      desc: '전통 료칸 체험',
      points: 3000,
      deadline: '2024.12.10',
      image: '',
      titleI18n: { ja: '京都 旅館宿泊', en: 'Kyoto Ryokan Stay' },
      descI18n: { ja: '伝統旅館体験', en: 'Traditional ryokan experience' },
      locationI18n: { ja: '京都', en: 'Kyoto' },
    },
  ]);
  const [projectTab, setProjectTab] = useState<Category | 'all'>('all');
  const [projectSort, setProjectSort] = useState<ProjectSort>('points');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // 예약/신청 모달
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1~12
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const [myProjects, setMyProjects] = useState<MyProject[]>([]);

  // 게시판
  const [freePosts, setFreePosts] = useState<Post[]>([
    {
      id: 1,
      title: '오사카 맛집 추천해주세요!',
      author: 'user1',
      authorNickname: '여행러버',
      date: formatDate(new Date()),
      views: 234,
      comments: 0,
      content: '오사카 여행 예정입니다.',
      board: 'free',
      commentList: [],
    },
    {
      id: 2,
      title: '도쿄 호텔 체험 후기',
      author: 'user2',
      authorNickname: '호텔마니아',
      date: formatDate(new Date(Date.now() - 86400000)),
      views: 156,
      comments: 0,
      content: '정말 좋았어요!',
      board: 'free',
      commentList: [],
    },
  ]);
  const [lifePosts, setLifePosts] = useState<Post[]>([
    {
      id: 1,
      title: '도쿄 월세 정보',
      author: 'user3',
      authorNickname: '도쿄살이',
      date: formatDate(new Date()),
      views: 320,
      comments: 0,
      content: '도쿄 월세 정보 공유합니다.',
      board: 'life',
      commentList: [],
    },
  ]);

  const [boardSearch, setBoardSearch] = useState('');
  const [boardSort, setBoardSort] = useState<SortType>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 글쓰기/읽기 모달
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeBoard, setWriteBoard] = useState<'free' | 'life' | null>(null);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeImage, setWriteImage] = useState<string>('');
  const [showReadModal, setShowReadModal] = useState(false);
  const [readPost, setReadPost] = useState<Post | null>(null);

  // URL 제출 모달
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedMyProject, setSelectedMyProject] = useState<MyProject | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');

  // 관리자 탭
  const [adminTab, setAdminTab] = useState<TabType>('members');

  // 관리자: 안건 등록 모달
  const [showProjectCreate, setShowProjectCreate] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    category: 'restaurant',
    title: '',
    location: '',
    desc: '',
    points: 1000,
    deadline: '',
    image: '',
  });

  // 게시글 수정 모달(관리자/본인)
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  /* =========================
     로컬 스토리지 로드/세이브
  ========================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const lang = localStorage.getItem(LS.lang) as Lang | null;
      if (lang) setLanguage(lang);

      const rawUsers = localStorage.getItem(LS.users);
      if (rawUsers) setUsers(JSON.parse(rawUsers));

      const rawProjects = localStorage.getItem(LS.projects);
      if (rawProjects) setProjects(JSON.parse(rawProjects));

      const rawFree = localStorage.getItem(LS.postsFree);
      if (rawFree) setFreePosts(JSON.parse(rawFree));
      const rawLife = localStorage.getItem(LS.postsLife);
      if (rawLife) setLifePosts(JSON.parse(rawLife));

      const rawMy = localStorage.getItem(LS.myProjects);
      if (rawMy) setMyProjects(JSON.parse(rawMy));

      const uid = localStorage.getItem(LS.currentUserId);
      const logged = localStorage.getItem(LS.isLoggedIn) === 'true';
      const adminFlag = localStorage.getItem(LS.isAdmin) === 'true';

      if (uid) {
        const u = (rawUsers ? JSON.parse(rawUsers) : users).find((x: User) => x.id === uid);
        if (u) {
          setCurrentUser(u);
          setIsLoggedIn(logged);
          setIsAdmin(adminFlag || u.role === 'admin');
        }
      }
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.lang, language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.projects, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.postsFree, JSON.stringify(freePosts));
  }, [freePosts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.postsLife, JSON.stringify(lifePosts));
  }, [lifePosts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS.myProjects, JSON.stringify(myProjects));
  }, [myProjects]);

  const persistSession = (u: User | null, loggedIn: boolean, admin: boolean) => {
    if (typeof window === 'undefined') return;
    if (u) {
      localStorage.setItem(LS.currentUserId, u.id);
    } else {
      localStorage.removeItem(LS.currentUserId);
    }
    localStorage.setItem(LS.isLoggedIn, String(loggedIn));
    localStorage.setItem(LS.isAdmin, String(admin));
  };

  /* =========================
     로그인/회원가입
  ========================= */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const id = String(formData.get('loginId') || '').trim();

    let user = users.find((u) => u.id === id);
    if (!user) {
      alert(t.loginRequired);
      return;
    }
    setCurrentUser(user);
    const admin = user.role === 'admin' || id === 'admin';
    setIsAdmin(admin);
    setIsLoggedIn(true);
    persistSession(user, true, admin);
    setActiveMenu('home');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newUser: User = {
      id: String(formData.get('userId') || '').trim(),
      nickname: String(formData.get('nickname') || ''),
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      platform: Array.from(formData.getAll('platform')) as string[],
      region: String(formData.get('region') || ''),
      registrationDate: formatDate(new Date()),
      points: 0,
      contribution: 0,
      role: 'user',
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setIsAdmin(false);
    persistSession(newUser, true, false);
    alert(t.signupComplete);
    setIsRegisterTab(false);
    setActiveMenu('home');
  };

  const checkNickname = (nickname: string) => {
    if (!nickname) return;
    const exists = users.some((u) => u.nickname === nickname);
    setNicknameCheck(exists ? 'taken' : 'available');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    persistSession(null, false, false);
  };

  /* =========================
     프로젝트(신청)
  ========================= */
  const openReservation = (project: Project) => {
    if (!isLoggedIn || !currentUser) {
      alert(t.loginRequired);
      setActiveMenu('login');
      return;
    }
    setSelectedProject(project);
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedDate(null);
    setSelectedTime('10:00');
    setShowReservationModal(true);
  };

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

  const confirmReservation = () => {
    if (!selectedDate || !selectedProject || !currentUser) return;

    const newItem: MyProject = {
      id: myProjects.length + 1,
      userId: currentUser.id,
      projectName: pickI18n(language, selectedProject.title, selectedProject.titleI18n),
      date: `${selectedYear}.${String(selectedMonth).padStart(2, '0')}.${String(selectedDate).padStart(2, '0')}`,
      time: selectedTime,
      points: selectedProject.points,
      status: 'pending',
    };

    setMyProjects((prev) => [newItem, ...prev]);
    alert(`${t.applyDone}\n${newItem.projectName}\n${newItem.date} ${selectedTime}`);
    setShowReservationModal(false);
    setSelectedDate(null);
  };

  // 결과물 URL 제출
  const handleUrlSubmit = () => {
    if (!selectedMyProject || !submitUrl) return;

    setMyProjects((prev) =>
      prev.map((p) =>
        p.id === selectedMyProject.id ? { ...p, status: 'submitted', resultUrl: submitUrl } : p
      )
    );

    alert(t.urlSubmitted);
    setShowUrlModal(false);
    setSubmitUrl('');
  };

  // 관리자 승인
  const approveResult = (projectId: number) => {
    const proj = myProjects.find((p) => p.id === projectId);
    if (!proj) return;

    setMyProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'approved' } : p))
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === proj.userId
          ? { ...u, points: u.points + proj.points, contribution: u.contribution + 50 }
          : u
      )
    );

    if (currentUser?.id === proj.userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, points: prev.points + proj.points, contribution: prev.contribution + 50 } : null
      );
    }
  };

  const deductPoints = (userId: string, amount: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, points: Math.max(0, u.points - amount) } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, points: Math.max(0, prev.points - amount) } : null
      );
    }
    alert(t.pointsDeducted);
  };

  /* =========================
     글쓰기/게시판/댓글
  ========================= */
  const openWrite = (board: 'free' | 'life') => {
    if (!isLoggedIn) {
      alert(t.loginRequired);
      setActiveMenu('login');
      return;
    }
    setWriteBoard(board); // 버그 수정: 'board' 문자열이 아닌 실제 'free'/'life'
    setWriteTitle('');
    setWriteContent('');
    setWriteImage('');
    setShowWriteModal(true);
  };

  const submitWrite = () => {
    if (!writeBoard || !currentUser) return;

    const target = writeBoard === 'free' ? freePosts : lifePosts;
    const newPost: Post = {
      id: (target.length ? Math.max(...target.map((p) => p.id)) : 0) + 1,
      title: writeTitle || '제목 없음',
      author: currentUser.id,
      authorNickname: currentUser.nickname,
      date: formatDate(new Date()),
      views: 0,
      comments: 0,
      content: writeContent,
      image: writeImage,
      board: writeBoard,
      commentList: [],
    };

    if (writeBoard === 'free') {
      setFreePosts((prev) => [newPost, ...prev]);
    } else {
      setLifePosts((prev) => [newPost, ...prev]);
    }
    setShowWriteModal(false);
  };

  const sortPosts = (posts: Post[]) => {
    const filtered = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(boardSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(boardSearch.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      switch (boardSort) {
        case 'popular':
          return b.views - a.views;
        case 'comments':
          return b.comments - a.comments;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  };

  const getTrendingPosts = (posts: Post[]) =>
    posts.filter((p) => isWithinWeek(p.date)).sort((a, b) => (b.views + b.comments * 2) - (a.views + a.comments * 2)).slice(0, 3);

  const openReadPost = (post: Post, board: 'free' | 'life') => {
    // 조회수 증가
    if (board === 'free') {
      setFreePosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
      );
      const updated = freePosts.find((p) => p.id === post.id);
      setReadPost(updated ? { ...updated, views: updated.views + 1 } : { ...post, views: post.views + 1 });
    } else {
      setLifePosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
      );
      const updated = lifePosts.find((p) => p.id === post.id);
      setReadPost(updated ? { ...updated, views: updated.views + 1 } : { ...post, views: post.views + 1 });
    }
    setShowReadModal(true);
  };

  const addComment = (post: Post, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment: CommentItem = {
      id: (post.commentList && post.commentList.length ? Math.max(...post.commentList.map((c) => c.id)) : 0) + 1,
      authorId: currentUser.id,
      authorNickname: currentUser.nickname,
      date: formatDate(new Date()),
      text: text.trim(),
    };

    const updateOne = (p: Post) => {
      const list = p.commentList ? [...p.commentList, newComment] : [newComment];
      return { ...p, commentList: list, comments: list.length };
    };

    if (post.board === 'free') {
      setFreePosts((prev) => prev.map((p) => (p.id === post.id ? updateOne(p) : p)));
      const updated = freePosts.find((p) => p.id === post.id);
      setReadPost(updated ? updateOne(updated) : updateOne(post));
    } else {
      setLifePosts((prev) => prev.map((p) => (p.id === post.id ? updateOne(p) : p)));
      const updated = lifePosts.find((p) => p.id === post.id);
      setReadPost(updated ? updateOne(updated) : updateOne(post));
    }
  };

  const deleteComment = (post: Post, commentId: number) => {
    const updateOne = (p: Post) => {
      const list = (p.commentList || []).filter((c) => c.id !== commentId);
      return { ...p, commentList: list, comments: list.length };
    };

    if (post.board === 'free') {
      setFreePosts((prev) => prev.map((p) => (p.id === post.id ? updateOne(p) : p)));
      const updated = freePosts.find((p) => p.id === post.id);
      setReadPost(updated ? updateOne(updated) : updateOne(post));
    } else {
      setLifePosts((prev) => prev.map((p) => (p.id === post.id ? updateOne(p) : p)));
      const updated = lifePosts.find((p) => p.id === post.id);
      setReadPost(updated ? updateOne(updated) : updateOne(post));
    }
  };

  const deletePost = (post: Post) => {
    if (post.board === 'free') {
      setFreePosts((prev) => prev.filter((p) => p.id !== post.id));
    } else {
      setLifePosts((prev) => prev.filter((p) => p.id !== post.id));
    }
    setShowReadModal(false);
  };

  const openEditPost = (post: Post) => {
    setEditingPost({ ...post });
    setShowEditPostModal(true);
  };

  const saveEditPost = () => {
    if (!editingPost) return;
    const apply = (p: Post) => (p.id === editingPost.id ? editingPost : p);

    if (editingPost.board === 'free') {
      setFreePosts((prev) => prev.map(apply));
    } else {
      setLifePosts((prev) => prev.map(apply));
    }
    setShowEditPostModal(false);
  };

  /* =========================
     프로젝트 정렬/즐겨찾기
  ========================= */
  const sortProjects = (list: Project[]) => {
    let sorted = [...list];

    if (selectedRegion !== 'all') {
      sorted = sorted.filter((p) => p.location.includes(selectedRegion));
    }
    switch (projectSort) {
      case 'deadline':
        sorted.sort((a, b) => {
          if (!a.deadline || !b.deadline) return 0;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      case 'region':
        sorted.sort((a, b) => a.location.localeCompare(b.location));
        break;
      default:
        sorted.sort((a, b) => b.points - a.points);
    }
    return sorted;
  };

  const toggleFavorite = (projectId: number) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  // 데이터 내보내기
  const exportData = () => {
    const data = {
      users,
      projects,
      posts: [...freePosts, ...lifePosts],
      myProjects,
      exportDate: formatDate(new Date()),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koc-data-${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* =========================
     렌더링 섹션
  ========================= */
  const renderContent = () => {
    switch (activeMenu) {
      case 'home': {
        const trendingFree = getTrendingPosts(freePosts);
        return (
          <>
            <div className="content-header">
              <h2>{t.welcome} {currentUser?.nickname ? `${currentUser.nickname}님! 👋` : ''}</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card gradient-1">
                <div className="stat-label">{t.totalPoints}</div>
                <div className="stat-number">{currentUser?.points?.toLocaleString?.() || 0}{t.yen}</div>
              </div>
              <div className="stat-card gradient-2">
                <div className="stat-label">{t.completedProjects}</div>
                <div className="stat-number">{myProjects.filter((p) => p.status === 'approved').length}{t.cases}</div>
              </div>
              <div className="stat-card gradient-3">
                <div className="stat-label">{t.contribution}</div>
                <div className="stat-number">{currentUser?.contribution || 0}</div>
              </div>
              <div className="stat-card gradient-4">
                <div className="stat-label">{t.overallRanking}</div>
                <div className="stat-number">
                  {currentUser ? users.findIndex((u) => u.id === currentUser.id) + 1 : '-'}{t.rank}
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: 30 }}>🔥 {t.popularProjects}</h3>
            <div className="project-grid">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <span className="project-type">{t[project.category as keyof typeof t] || project.category}</span>
                    <button className="favorite-btn" onClick={() => toggleFavorite(project.id)}>
                      {project.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="project-title">{pickI18n(language, project.title, project.titleI18n)}</h3>
                  <p className="project-location">📍 {pickI18n(language, project.location, project.locationI18n)}</p>
                  <p className="project-deadline">⏰ {project.deadline}</p>
                  <div className="project-points">💰 {project.points.toLocaleString()}{t.yen}</div>
                  <button className="apply-btn" onClick={() => openReservation(project)}>{t.apply}</button>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 30 }}>📈 {t.trendingPosts} ({t.freeBoard})</h3>
            <div className="post-list">
              {trendingFree.map((post) => (
                <div
                  key={post.id}
                  className="post-item"
                  onClick={() => openReadPost(post, 'free')}
                >
                  <div className="post-title">
                    {post.title} <span className="post-badge">HOT</span>
                  </div>
                  <div className="post-meta">
                    {post.authorNickname} | {post.date} | {t.views} {post.views} | {t.comments} {post.comments}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      }

      case 'projects': {
        const filtered = projectTab === 'all' ? projects : projects.filter((p) => p.category === projectTab);
        const sortedProjects = sortProjects(filtered);
        const favoriteProjects = sortedProjects.filter((p) => p.isFavorite);
        const regularProjects = sortedProjects.filter((p) => !p.isFavorite);
        const displayProjects = [...favoriteProjects, ...regularProjects];

        return (
          <>
            <div className="content-header">
              <h2>📋 {t.allProjects}</h2>
            </div>

            <div className="filter-section">
              <div className="tabs">
                {(['all', 'restaurant', 'hotel', 'tourist', 'others'] as const).map((tab) => (
                  <div
                    key={tab}
                    className={`tab ${projectTab === tab ? 'active' : ''}`}
                    onClick={() => setProjectTab(tab)}
                  >
                    {tab === 'all' ? t.all : t[tab as keyof typeof t]}
                  </div>
                ))}
              </div>

              <div className="filter-controls">
                <select
                  value={projectSort}
                  onChange={(e) => setProjectSort(e.target.value as ProjectSort)}
                  className="filter-select"
                >
                  <option value="points">{t.sortByPoints}</option>
                  <option value="deadline">{t.sortByDeadline}</option>
                  <option value="region">{t.filterByRegion}</option>
                </select>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">모든 지역</option>
                  <option value="도쿄">{t.tokyo}</option>
                  <option value="오사카">{t.osaka}</option>
                  <option value="교토">{t.kyoto}</option>
                </select>
              </div>
            </div>

            <div className="project-grid">
              {displayProjects.map((project) => (
                <div key={project.id} className={`project-card ${project.isFavorite ? 'favorite' : ''}`}>
                  <div className="project-header">
                    <span className="project-type">{t[project.category as keyof typeof t]}</span>
                    <button className="favorite-btn" onClick={() => toggleFavorite(project.id)}>
                      {project.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="project-title">{pickI18n(language, project.title, project.titleI18n)}</h3>
                  <p className="project-location">📍 {pickI18n(language, project.location, project.locationI18n)}</p>
                  <p className="project-deadline">⏰ {project.deadline}</p>
                  {project.image && <img src={project.image} alt="project" className="image-preview" />}
                  <p style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
                    {pickI18n(language, project.desc, project.descI18n)}
                  </p>
                  <div className="project-points">💰 {project.points.toLocaleString()}{t.yen}</div>
                  <button className="apply-btn" onClick={() => openReservation(project)}>{t.apply}</button>
                </div>
              ))}
            </div>
          </>
        );
      }

      case 'board':
      case 'life': {
        const isFree = activeMenu === 'board';
        const posts = isFree ? freePosts : lifePosts;
        const sortedPosts = sortPosts(posts);
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
        const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

        return (
          <>
            <div className="content-header">
              <h2>{isFree ? '💬 ' + t.freeBoard : '💡 ' + t.lifeBoard}</h2>
            </div>

            <div className="board-controls">
              <button
                className="apply-btn"
                style={{ width: 'auto' }}
                onClick={() => openWrite(isFree ? 'free' : 'life')}
              >{/* 버그 수정: 각 게시판에 맞게 */}
                ✏️ {t.writePost}
              </button>

              <div className="search-sort">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={boardSearch}
                  onChange={(e) => setBoardSearch(e.target.value)}
                  className="search-input"
                />

                <select
                  value={boardSort}
                  onChange={(e) => setBoardSort(e.target.value as SortType)}
                  className="filter-select"
                >
                  <option value="latest">{t.sortLatest}</option>
                  <option value="popular">{t.sortPopular}</option>
                  <option value="comments">{t.sortComments}</option>
                </select>
              </div>
            </div>

            <div className="post-list">
              {currentPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-item"
                  onClick={() => openReadPost(post, isFree ? 'free' : 'life')}
                >
                  <div className="post-title">
                    {post.title}
                    {post.image && ' 🖼️'}
                    {isWithinWeek(post.date) && post.views > 100 && <span className="post-badge">HOT</span>}
                  </div>
                  <div className="post-meta">
                    {post.authorNickname} | {post.date} | {t.views} {post.views} | {t.comments} {post.comments}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  {t.prevPage}
                </button>

                <span className="page-info">{currentPage} / {totalPages}</span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  {t.nextPage}
                </button>
              </div>
            )}
          </>
        );
      }

      case 'ranking': {
        const rankedUsers = [...users].sort((a, b) => b.contribution - a.contribution);
        return (
          <>
            <div className="content-header">
              <h2>🏆 {t.contributionRanking}</h2>
            </div>

            <table className="ranking-table">
              <thead>
                <tr>
                  <th>{t.rankingHeader}</th>
                  <th>{t.nickname}</th>
                  <th>{t.contributionScore}</th>
                  <th>{t.completedCases}</th>
                  <th>{t.earnedPoints}</th>
                </tr>
              </thead>
              <tbody>
                {rankedUsers.slice(0, 10).map((user, idx) => (
                  <tr key={user.id}>
                    <td>
                      <span className={`rank-medal ${idx < 3 ? `rank-${idx + 1}` : ''}`}>{idx + 1}</span>
                    </td>
                    <td>{user.nickname}</td>
                    <td>{user.contribution.toLocaleString()}</td>
                    <td>{Math.floor(user.contribution / 50)}{t.cases}</td>
                    <td>{user.points.toLocaleString()}{t.yen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      }

      case 'mypage': {
        if (!isLoggedIn || !currentUser) {
          alert(t.loginRequired);
          setActiveMenu('login');
          return null;
        }

        // 내가 쓴 글
        const myPosts = [...freePosts, ...lifePosts].filter((p) => p.author === currentUser.id);

        return (
          <>
            <div className="content-header">
              <h2>👤 {t.myPage}</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card gradient-1">
                <div className="stat-label">{t.myPoints}</div>
                <div className="stat-number">{currentUser.points.toLocaleString()}{t.yen}</div>
              </div>
              <div className="stat-card gradient-2">
                <div className="stat-label">{t.contribution}</div>
                <div className="stat-number">{currentUser.contribution}</div>
              </div>
            </div>

            <h3 style={{ marginTop: 30 }}>{t.myProjects}</h3>
            <div className="project-status-list">
              {myProjects
                .filter((p) => p.userId === currentUser.id)
                .map((project) => (
                  <div key={project.id} className="project-status-item">
                    <div className="project-status-info">
                      <div className="project-status-title">{project.projectName}</div>
                      <div className="project-status-meta">
                        {project.date} {project.time ? `| ${project.time}` : ''} | {project.points}{t.yen} |
                        <span className={`status-badge status-${project.status}`}>{t[project.status]}</span>
                      </div>
                      {project.resultUrl && <div className="project-url">URL: {project.resultUrl}</div>}
                    </div>
                    {project.status === 'pending' && (
                      <button
                        className="submit-url-btn"
                        onClick={() => {
                          setSelectedMyProject(project);
                          setShowUrlModal(true);
                        }}
                      >
                        {t.submitResult}
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {currentUser.points >= 20000 && (
              <button className="submit-btn" style={{ marginTop: 20 }}>
                {t.requestRefund}
              </button>
            )}

            <h3 style={{ marginTop: 30 }}>{t.myPosts}</h3>
            <div className="post-list">
              {myPosts.map((post) => (
                <div key={post.id} className="post-item">
                  <div className="post-title">
                    [{post.board === 'free' ? t.freeBoard : t.lifeBoard}] {post.title}
                  </div>
                  <div className="post-meta">
                    {post.date} | {t.views} {post.views} | {t.comments} {post.comments}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button className="admin-btn" onClick={() => openEditPost(post)}>{t.edit}</button>
                    <button className="admin-btn reject" onClick={() => deletePost(post)}>{t.remove}</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      }

      case 'login': {
        return (
          <div className="auth-container">
            <div className="content-header">
              <h2>{isRegisterTab ? t.signup : t.login}</h2>
            </div>

            <div className="tabs">
              <div className={`tab ${!isRegisterTab ? 'active' : ''}`} onClick={() => setIsRegisterTab(false)}>
                {t.login}
              </div>
              <div className={`tab ${isRegisterTab ? 'active' : ''}`} onClick={() => setIsRegisterTab(true)}>
                {t.signup}
              </div>
            </div>

            {!isRegisterTab ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>{t.id}</label>
                  <input type="text" name="loginId" placeholder={t.enterID} required />
                </div>
                <div className="form-group">
                  <label>{t.password}</label>
                  <input type="password" name="loginPassword" placeholder={t.enterPassword} required />
                </div>
                <button type="submit" className="submit-btn">{t.login}</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>{t.id} *</label>
                  <input type="text" name="userId" placeholder={t.enterID} required />
                </div>

                <div className="form-group">
                  <label>{t.nicknameLabel} *</label>
                  <div className="input-with-button">
                    <input type="text" name="nickname" placeholder={t.enterNickname} required />
                    <button
                      type="button"
                      className="check-btn"
                      onClick={(e) => {
                        const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | null);
                        if (input) checkNickname(input.value);
                      }}
                    >
                      {t.checkDuplicate}
                    </button>
                  </div>
                  {nicknameCheck === 'available' && <div className="check-message success">{t.nicknameAvailable}</div>}
                  {nicknameCheck === 'taken' && <div className="check-message error">{t.nicknameTaken}</div>}
                </div>

                <div className="form-group">
                  <label>{t.name} *</label>
                  <input type="text" name="name" placeholder={t.name} required />
                </div>

                <div className="form-group">
                  <label>{t.password} *</label>
                  <input type="password" placeholder={t.enterPassword} required />
                </div>

                <div className="form-group">
                  <label>{t.passwordConfirm} *</label>
                  <input type="password" placeholder={t.reenterPassword} required />
                </div>

                <div className="form-group">
                  <label>{t.email} *</label>
                  <input type="email" name="email" placeholder="example@email.com" required />
                </div>

                <div className="form-group">
                  <label>{t.phone} *</label>
                  <input type="tel" name="phone" placeholder="080-1234-5678" required />
                </div>

                <div className="form-group">
                  <label>{t.activityPlatform} *</label>
                  <div className="checkbox-list">
                    <label className="checkbox-item">
                      <input type="checkbox" name="platform" value="네이버 블로그" />
                      <span>{t.naverBlog}</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="platform" value="유튜브" />
                      <span>{t.youtube}</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" name="platform" value="인스타그램" />
                      <span>{t.instagram}</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.residence} *</label>
                  <select name="region" required>
                    <option value="">{t.selectOption}</option>
                    <option value="도쿄">{t.tokyo}</option>
                    <option value="오사카">{t.osaka}</option>
                    <option value="교토">{t.kyoto}</option>
                    <option value="기타">{t.others}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-item">
                    <input type="checkbox" required />
                    <span>{t.privacyAgree}</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" required />
                    <span>{t.termsAgree}</span>
                  </label>
                </div>

                <button type="submit" className="submit-btn">{t.signup}</button>
              </form>
            )}
          </div>
        );
      }

      case 'admin': {
        if (!isAdmin) {
          alert('관리자만 접근 가능합니다');
          setActiveMenu('home');
          return null;
        }

        return (
          <>
            <div className="content-header">
              <h2>⚙️ {t.admin}</h2>
            </div>

            <div className="tabs">
              {(['members', 'projects', 'statistics', 'export'] as TabType[]).map((tab) => (
                <div
                  key={tab}
                  className={`tab ${adminTab === tab ? 'active' : ''}`}
                  onClick={() => setAdminTab(tab)}
                >
                  {tab === 'members' ? t.memberManagement :
                    tab === 'projects' ? t.projectManagement :
                      tab === 'statistics' ? t.statistics : t.exportData}
                </div>
              ))}
            </div>

            {adminTab === 'members' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t.name}</th>
                    <th>{t.nickname}</th>
                    <th>{t.email}</th>
                    <th>{t.phone}</th>
                    <th>{t.activityPlatform}</th>
                    <th>{t.residence}</th>
                    <th>{t.points}</th>
                    <th>{t.registrationDate}</th>
                    <th>{t.manage}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.nickname}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.platform.join(', ')}</td>
                      <td>{user.region}</td>
                      <td>{user.points.toLocaleString()}</td>
                      <td>{user.registrationDate}</td>
                      <td>
                        <button
                          className="admin-btn"
                          onClick={() => {
                            const amount = prompt('차감할 포인트를 입력하세요:');
                            if (amount) deductPoints(user.id, parseInt(amount));
                          }}
                        >
                          {t.deductPoints}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {adminTab === 'projects' && (
              <div className="admin-projects">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>제출된 결과물 관리</h3>
                  <button className="submit-btn" style={{ width: 'auto' }} onClick={() => setShowProjectCreate(true)}>
                    ➕ {t.addProject}
                  </button>
                </div>

                <table className="admin-table" style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th>프로젝트</th>
                      <th>사용자</th>
                      <th>제출 URL</th>
                      <th>상태</th>
                      <th>포인트</th>
                      <th>{t.manage}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProjects.filter((p) => p.status === 'submitted').map((project) => {
                      const u = users.find((x) => x.id === project.userId);
                      return (
                        <tr key={project.id}>
                          <td>{project.projectName}</td>
                          <td>{u?.nickname || '-'}</td>
                          <td>{project.resultUrl}</td>
                          <td>{t[project.status]}</td>
                          <td>{project.points}</td>
                          <td>
                            <button className="admin-btn approve" onClick={() => approveResult(project.id)}>
                              {t.approveResult}
                            </button>
                            <button
                              className="admin-btn reject"
                              onClick={() => {
                                setMyProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: 'rejected' } : p)));
                              }}
                            >
                              {t.rejectResult}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* 게시글 관리 */}
                <h3 style={{ marginTop: 30 }}>{t.postManage}</h3>
                <table className="admin-table" style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th>게시판</th>
                      <th>{t.titleLabel}</th>
                      <th>{t.nickname}</th>
                      <th>{t.views}</th>
                      <th>{t.comments}</th>
                      <th>{t.manage}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...freePosts, ...lifePosts].map((post) => (
                      <tr key={`adm-${post.board}-${post.id}`}>
                        <td>{post.board === 'free' ? t.freeBoard : t.lifeBoard}</td>
                        <td>{post.title}</td>
                        <td>{post.authorNickname}</td>
                        <td>{post.views}</td>
                        <td>{post.comments}</td>
                        <td>
                          <button className="admin-btn" onClick={() => openEditPost(post)}>{t.edit}</button>
                          <button className="admin-btn reject" onClick={() => deletePost(post)}>{t.remove}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'statistics' && (
              <div className="statistics">
                <div className="stats-grid">
                  <div className="stat-card gradient-1">
                    <div className="stat-label">{t.totalMembers}</div>
                    <div className="stat-number">{users.length}</div>
                  </div>
                  <div className="stat-card gradient-2">
                    <div className="stat-label">{t.activeProjects}</div>
                    <div className="stat-number">{projects.length}</div>
                  </div>
                  <div className="stat-card gradient-3">
                    <div className="stat-label">{t.monthlyRevenue}</div>
                    <div className="stat-number">¥{(users.reduce((acc, u) => acc + u.points, 0) * 0.1).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'export' && (
              <div className="export-section">
                <h3>데이터 내보내기</h3>
                <p>모든 회원, 프로젝트, 게시글 데이터를 JSON 형식으로 내보냅니다.</p>
                <button className="submit-btn" style={{ width: 'auto' }} onClick={exportData}>
                  📊 {t.exportToSpreadsheet}
                </button>
              </div>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  /* =========================
     JSX
  ========================= */
  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Malgun Gothic", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans JP", sans-serif;
          background: #f4f5f7;
          min-height: 100vh;
          color: #222;               /* 가독성 ↑ */
          font-size: 16px;          /* 기본 폰트 크기 ↑ */
          line-height: 1.6;         /* 가독성 ↑ */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        h1,h2,h3 { color:#111; letter-spacing:.2px; }
        label, .stat-label, .post-meta, .menu-category { color:#333; }
        input, select, textarea { color:#111; }

        header {
          background: #ffffff;
          color: #111;
          padding: 12px 0;
          border-bottom: 1px solid #eaeaea;
          position: sticky; top: 0; z-index: 20;
        }
        .header-content {
          max-width: 1200px; margin: 0 auto; padding: 0 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo { font-size: 22px; font-weight: 800; cursor: pointer; color:#03c75a; }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .points-badge {
          background: #f4fbf7; padding: 6px 12px; border-radius: 999px; font-size: 14px; color:#026a39; border:1px solid #d6f0e2;
        }

        /* 언어 토글 UI (가시성↑) */
        .lang-switch {
          display: inline-flex; background:#f5f5f5; border:1px solid #e5e5e5; border-radius: 999px; overflow:hidden;
        }
        .lang-btn2 {
          padding: 6px 10px; font-size: 13px; cursor: pointer; border:none; background:transparent; color:#555;
        }
        .lang-btn2.active { background:#03c75a; color:#fff; }

        .main-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; display: flex; gap: 20px; }
        .sidebar { width: 220px; background: white; border-radius: 8px; padding: 20px; height: fit-content; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border:1px solid #eee; }
        .menu-category { font-size: 12px; color: #666; margin: 15px 0 5px 5px; font-weight: bold; }
        .menu-item { padding: 12px 15px; margin: 6px 0; border-radius: 8px; cursor: pointer; transition: all .2s; font-size: 14px; color:#222; border:1px solid transparent; }
        .menu-item:hover { background: #f7f7f7; }
        .menu-item.active { background: #03c75a; color: white; border-color:#03c75a; }

        .content { flex: 1; background: white; border-radius: 12px; padding: 26px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border:1px solid #eee; }
        .content-header { border-bottom: 2px solid #03c75a; padding-bottom: 12px; margin-bottom: 20px; }
        .content-header h2 { color: #111; font-size: 20px; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 16px 0 6px; }
        .stat-card { color: white; padding: 18px; border-radius: 12px; text-align: center; }
        .stat-number { font-size: 28px; font-weight: 800; margin: 8px 0; letter-spacing:.3px; }
        .stat-label { font-size: 13px; opacity: .95; }

        .gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
        .project-card { border: 1px solid #eee; border-radius: 10px; padding: 16px; transition: all .2s; position: relative; }
        .project-card.favorite { border-color: #ffd700; background: #fffef5; }
        .project-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .project-type { display: inline-block; padding: 4px 8px; background: #e7f5ff; color: #0c8599; border-radius: 6px; font-size: 12px; }
        .favorite-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
        .project-title { font-size: 18px; margin-bottom: 8px; color: #111; font-weight: 700; }
        .project-location, .project-deadline { color: #555; font-size: 14px; margin-bottom: 4px; }
        .project-points { color: #03c75a; font-weight: 800; margin-top: 8px; }
        .apply-btn { width: 100%; padding: 10px; background: #03c75a; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 12px; font-size: 14px; transition: background .2s; }
        .apply-btn:hover { background: #02b351; }

        .filter-section { margin-bottom: 12px; }
        .filter-controls { display: flex; gap: 10px; margin-top: 8px; }
        .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; color:#111; background:#fff; }

        .board-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .search-sort { display: flex; gap: 10px; }
        .search-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; width: 220px; }

        .post-list { margin-top: 10px; }
        .post-item { padding: 14px; border-bottom: 1px solid #eee; cursor: pointer; transition: background .2s; }
        .post-item:hover { background: #fafafa; }
        .post-title { font-size: 16px; color: #111; margin-bottom: 4px; font-weight: 700; }
        .post-meta { font-size: 13px; color: #777; }
        .post-badge { display: inline-block; padding: 2px 6px; background: #ff6b6b; color: white; border-radius: 999px; font-size: 11px; margin-left: 6px; }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 16px; }
        .page-btn { padding: 8px 16px; background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer; }
        .page-btn:disabled { opacity: .5; cursor: not-allowed; }
        .page-info { color: #666; }

        .ranking-table, .admin-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        .ranking-table th, .admin-table th { background: #fafafa; padding: 12px; text-align: left; font-size: 14px; color: #444; border-bottom: 2px solid #eee; }
        .ranking-table td, .admin-table td { padding: 12px; border-bottom: 1px solid #eee; }

        .rank-medal { display: inline-block; width: 25px; height: 25px; border-radius: 50%; text-align: center; line-height: 25px; font-weight: bold; color: white; font-size: 12px; }
        .rank-1 { background: gold; color: #333; }
        .rank-2 { background: silver; color: #333; }
        .rank-3 { background: #cd7f32; }

        .project-status-list { margin-top: 10px; }
        .project-status-item { padding: 12px; border: 1px solid #eee; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .project-status-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; color:#111; }
        .project-status-meta { font-size: 13px; color: #555; }
        .status-badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; margin-left: 10px; }
        .status-pending { background: #ffd700; color: #333; }
        .status-submitted { background: #4169e1; color: white; }
        .status-approved { background: #32cd32; color: white; }
        .status-rejected { background: #dc143c; color: white; }

        .project-url { font-size: 12px; color: #0066cc; margin-top: 5px; }
        .submit-url-btn { padding: 8px 16px; background: #03c75a; color: white; border: none; border-radius: 8px; cursor: pointer; }

        .auth-container { max-width: 420px; margin: 0 auto; }
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; margin-bottom: 6px; color: #111; font-size: 14px; font-weight:700; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background:#fff; }
        .input-with-button { display: flex; gap: 8px; }
        .input-with-button input { flex: 1; }
        .check-btn { padding: 10px 14px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; }
        .check-message { margin-top: 5px; font-size: 12px; }
        .check-message.success { color: #2aa745; }
        .check-message.error { color: #dc143c; }
        .checkbox-list { display: flex; flex-direction: column; gap: 8px; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .checkbox-item input { width: auto; }

        .submit-btn { width: 100%; padding: 12px; background: #03c75a; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight:800; }
        .submit-btn:hover { background: #02b351; }

        .tabs { display: flex; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #eee; }
        .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s; }
        .tab:hover { background: #fafafa; }
        .tab.active { border-bottom-color: #03c75a; color: #03c75a; }

        .admin-btn { padding: 8px 12px; margin: 0 2px; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; background:#666; color:#fff; }
        .admin-btn.approve { background: #32cd32; }
        .admin-btn.reject { background: #dc143c; }

        .export-section { padding: 10px; }
        .export-section h3 { margin-bottom: 10px; }
        .export-section p { color: #666; margin-bottom: 14px; }

        .modal {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
          padding: 16px;
        }
        .modal-content {
          background: white; padding: 20px; border-radius: 12px; max-width: 560px; width: 100%;
          max-height: 80vh; overflow-y: auto; border:1px solid #eee;
        }
        .modal-close { float: right; font-size: 24px; cursor: pointer; color: #999; }
        .modal-close:hover { color: #333; }

        .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 12px 0; }
        .calendar-day { padding: 10px; text-align: center; border: 1px solid #e0e0e0; cursor: pointer; transition: all .2s; border-radius: 8px; }
        .calendar-day:hover { background: #f0f0f0; }
        .calendar-day.selected { background: #03c75a; color: white; }

        .image-upload-area { border: 2px dashed #ddd; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; margin-top: 10px; }
        .image-upload-area:hover { background: #f8f9fa; }
        .image-preview { max-width: 100%; margin-top: 10px; border-radius: 10px; border:1px solid #eee; }

        .lang-row { display:flex; align-items:center; gap:12px; }

        @media (max-width: 768px) {
          .main-container { flex-direction: column; }
          .sidebar { width: 100%; }
          .project-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header>
        <div className="header-content">
          <div className="logo" onClick={() => setActiveMenu('home')}>
            🌟 {t.systemTitle}
          </div>

          <div className="user-info">
            {/* 언어 토글 UI 개선 */}
            <div className="lang-switch" role="tablist" aria-label="Language switch">
              {(['ko','ja','en'] as Lang[]).map((lng) => (
                <button
                  key={lng}
                  className={`lang-btn2 ${language === lng ? 'active' : ''}`}
                  onClick={() => setLanguage(lng)}
                  aria-selected={language === lng}
                  role="tab"
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>

            {isLoggedIn && currentUser && (
              <div className="points-badge">💰 {t.points}: {currentUser.points.toLocaleString()}{t.yen}</div>
            )}

            <span>{isLoggedIn && currentUser ? `${currentUser.nickname}님` : t.loginPrompt}</span>

            <button
              onClick={isLoggedIn ? handleLogout : () => setActiveMenu('login')}
              className="admin-btn"
              style={{ background: isLoggedIn ? '#eee' : '#03c75a', color: isLoggedIn ? '#333' : '#fff' }}
            >
              {isLoggedIn ? t.logout : t.login}
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <div className="menu-category">{t.mainMenu}</div>
          <div className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`} onClick={() => setActiveMenu('home')}>🏠 {t.home}</div>
          <div className={`menu-item ${activeMenu === 'projects' ? 'active' : ''}`} onClick={() => setActiveMenu('projects')}>📋 {t.projectList}</div>
          <div className={`menu-item ${activeMenu === 'mypage' ? 'active' : ''}`} onClick={() => setActiveMenu('mypage')}>👤 {t.myPage}</div>

          <div className="menu-category">{t.community}</div>
          <div className={`menu-item ${activeMenu === 'board' ? 'active' : ''}`} onClick={() => setActiveMenu('board')}>💬 {t.freeBoard}</div>
          <div className={`menu-item ${activeMenu === 'life' ? 'active' : ''}`} onClick={() => setActiveMenu('life')}>💡 {t.lifeBoard}</div>
          <div className={`menu-item ${activeMenu === 'ranking' ? 'active' : ''}`} onClick={() => setActiveMenu('ranking')}>🏆 {t.ranking}</div>

          <div className="menu-category">{t.management}</div>
          <div className={`menu-item ${activeMenu === 'admin' ? 'active' : ''}`} onClick={() => setActiveMenu('admin')}>⚙️ {t.admin}</div>
        </aside>

        <main className="content">
          {renderContent()}
        </main>
      </div>

      {/* 신청 모달 (기존 "예약" → "신청") */}
      {showReservationModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowReservationModal(false)}>&times;</span>
            <h2>{t.projectApply}</h2>

            <div className="form-group">
              <label>{t.projectTitle}</label>
              <input type="text" value={selectedProject ? pickI18n(language, selectedProject.title, selectedProject.titleI18n) : ''} readOnly />
            </div>

            <div className="form-group">
              <label>{t.pickDate}</label>

              {/* 연/월 선택 */}
              <div className="lang-row">
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="filter-select" style={{ width: 120 }}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}{language === 'ja' ? t.year : language === 'en' ? ` ${t.year}` : t.year}</option>
                  ))}
                </select>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="filter-select" style={{ width: 120 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}{language === 'ja' ? t.month : language === 'en' ? ` ${t.month}` : t.month}</option>
                  ))}
                </select>
              </div>

              {/* 달력 */}
              <div className="calendar">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{day}</div>
                ))}
                {Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    className={`calendar-day ${selectedDate === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>{t.pickTime}</label>
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                {['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map((tm) => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
            </div>

            <button className="submit-btn" onClick={confirmReservation}>
              {t.confirmApply}
            </button>
          </div>
        </div>
      )}

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowWriteModal(false)}>&times;</span>
            <h2>{writeBoard === 'free' ? t.freeBoard : t.lifeBoard} - {t.writePost}</h2>

            <div className="form-group">
              <label>{t.titleLabel}</label>
              <input type="text" value={writeTitle} onChange={(e) => setWriteTitle(e.target.value)} placeholder={t.titleLabel} />
            </div>

            <div className="form-group">
              <label>{t.contentLabel}</label>
              <textarea
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
                placeholder={t.contentLabel}
                rows={6}
              />
            </div>

            <div className="form-group">
              <label>{t.imageUpload}</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setWriteImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {writeImage && <img src={writeImage} className="image-preview" alt="Preview" />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="submit-btn" onClick={submitWrite} style={{ width: 'auto', padding: '10px 20px' }}>
                {t.postSubmit}
              </button>
              <button
                className="tab"
                style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => setShowWriteModal(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글 읽기 + 댓글 모달 */}
      {showReadModal && readPost && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowReadModal(false)}>&times;</span>
            <h2>{readPost.title}</h2>

            <div className="post-meta" style={{ marginBottom: 12 }}>
              {readPost.authorNickname} | {readPost.date} | {t.views} {readPost.views} | {t.comments} {readPost.comments}
            </div>

            <div style={{ whiteSpace: 'pre-wrap', color:'#111' }}>{readPost.content}</div>
            {readPost.image && <img src={readPost.image} style={{ maxWidth: '100%', marginTop: 12, borderRadius: 10 }} alt="Post" />}

            {/* 본문 수정/삭제(본인 또는 관리자) */}
            {(isAdmin || currentUser?.id === readPost.author) && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="admin-btn" onClick={() => openEditPost(readPost)}>{t.edit}</button>
                <button className="admin-btn reject" onClick={() => deletePost(readPost)}>{t.remove}</button>
              </div>
            )}

            {/* 댓글 */}
            <div style={{ marginTop: 20 }}>
              <h3>💬 {t.comments} ({readPost.comments})</h3>
              <div style={{ marginTop: 8 }}>
                {(readPost.commentList || []).map((c) => (
                  <div key={c.id} style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
                    <div style={{ fontWeight: 700, color:'#111' }}>{c.authorNickname} <span style={{ color:'#777', fontWeight:400 }}>· {c.date}</span></div>
                    <div style={{ marginTop: 4 }}>{c.text}</div>
                    {(isAdmin || currentUser?.id === c.authorId) && (
                      <button
                        className="admin-btn reject"
                        style={{ marginTop: 6 }}
                        onClick={() => deleteComment(readPost, c.id)}
                      >
                        {t.deleteComment}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isLoggedIn ? (
                <div style={{ marginTop: 10 }}>
                  <textarea id="newComment" rows={3} placeholder={t.addComment} className="form-group textarea" style={{ width: '100%' }} />
                  <button
                    className="submit-btn"
                    style={{ width: 'auto', marginTop: 8 }}
                    onClick={() => {
                      const el = document.getElementById('newComment') as HTMLTextAreaElement | null;
                      if (el) {
                        addComment(readPost, el.value);
                        el.value = '';
                      }
                    }}
                  >
                    {t.addComment}
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 10, color:'#666' }}>{t.loginRequired}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URL 제출 모달 */}
      {showUrlModal && selectedMyProject && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowUrlModal(false)}>&times;</span>
            <h2>{t.submitResult}</h2>

            <div className="form-group">
              <label>{t.projectTitle}</label>
              <input type="text" value={selectedMyProject.projectName} readOnly />
            </div>

            <div className="form-group">
              <label>{t.resultUrl}</label>
              <input
                type="url"
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                placeholder="https://example.com/my-review"
              />
            </div>

            <button className="submit-btn" onClick={handleUrlSubmit}>
              {t.submitUrl}
            </button>
          </div>
        </div>
      )}

      {/* 게시글 수정 모달 */}
      {showEditPostModal && editingPost && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowEditPostModal(false)}>&times;</span>
            <h2>{t.edit} - {editingPost.board === 'free' ? t.freeBoard : t.lifeBoard}</h2>

            <div className="form-group">
              <label>{t.titleLabel}</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>{t.contentLabel}</label>
              <textarea
                rows={6}
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>{t.imageUpload}</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setEditingPost({ ...editingPost, image: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {editingPost.image && <img src={editingPost.image} className="image-preview" alt="Preview" />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="submit-btn" onClick={saveEditPost} style={{ width: 'auto', padding: '10px 20px' }}>
                {t.save}
              </button>
              <button
                className="tab"
                style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => setShowEditPostModal(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자: 안건 등록 모달 */}
      {showProjectCreate && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowProjectCreate(false)}>&times;</span>
            <h2>➕ {t.addProject}</h2>

            <div className="form-group">
              <label>{t.projectCategory}</label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject((p) => ({ ...p, category: e.target.value as Category }))}
              >
                <option value="restaurant">{t.restaurant}</option>
                <option value="hotel">{t.hotel}</option>
                <option value="tourist">{t.tourist}</option>
                <option value="others">{t.others}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t.projectTitle}</label>
              <input
                type="text"
                value={newProject.title || ''}
                onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                placeholder={t.projectTitle}
              />
            </div>

            <div className="form-group">
              <label>{t.projectLocation}</label>
              <input
                type="text"
                value={newProject.location || ''}
                onChange={(e) => setNewProject((p) => ({ ...p, location: e.target.value }))}
                placeholder={t.projectLocation}
              />
            </div>

            <div className="form-group">
              <label>{t.projectDesc}</label>
              <textarea
                rows={4}
                value={newProject.desc || ''}
                onChange={(e) => setNewProject((p) => ({ ...p, desc: e.target.value }))}
                placeholder={t.projectDesc}
              />
            </div>

            <div className="form-group">
              <label>{t.projectPoints}</label>
              <input
                type="number"
                value={newProject.points || 0}
                onChange={(e) => setNewProject((p) => ({ ...p, points: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group">
              <label>{t.projectDeadline}</label>
              <input
                type="text"
                value={newProject.deadline || ''}
                onChange={(e) => setNewProject((p) => ({ ...p, deadline: e.target.value }))}
                placeholder="2024.12.31"
              />
            </div>

            <div className="form-group">
              <label>{t.projectImage}</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setNewProject((p) => ({ ...p, image: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newProject.image && <img src={newProject.image} className="image-preview" alt="Project" />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="submit-btn"
                style={{ width: 'auto' }}
                onClick={() => {
                  if (!newProject.title || !newProject.location || !newProject.points) {
                    alert('필수 항목을 입력하세요.');
                    return;
                  }
                  const next: Project = {
                    id: (projects.length ? Math.max(...projects.map((p) => p.id)) : 0) + 1,
                    category: (newProject.category as Category) || 'others',
                    title: newProject.title!,
                    location: newProject.location!,
                    desc: newProject.desc || '',
                    points: newProject.points || 0,
                    deadline: newProject.deadline || undefined,
                    image: newProject.image || '',
                  };
                  setProjects((prev) => [next, ...prev]);
                  setShowProjectCreate(false);
                  setNewProject({ category: 'restaurant', title: '', location: '', desc: '', points: 1000, deadline: '', image: '' });
                }}
              >
                {t.submit}
              </button>

              <button
                className="tab"
                style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => setShowProjectCreate(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
