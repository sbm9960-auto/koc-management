'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';

// 타입 정의
type Lang = 'ko' | 'ja' | 'en' | 'zh';
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
}

interface Project {
  id: number;
  category: Category;
  title: string;
  location: string;
  desc: string;
  points: number;
  deadline?: string;
  isFavorite?: boolean;
  image?: string; // ★ 관리자 등록 시 이미지
}

interface Post {
  id: number;
  title: string;
  author: string;
  authorNickname: string;
  date: string;
  views: number;
  comments: number;
  content: string;
  image?: string;
}

interface MyProject {
  id: number;
  projectName: string;
  date: string;
  points: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  resultUrl?: string;
  // ★ 신청 버그 수정: 신청자 연결 + 시간 저장
  userId: string;
  time?: string;
}

// 다언어 번역
const translations = {
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
    signupComplete: '회원가입이 완료되었습니다! 로그인해주세요.',
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
    signupComplete: '会員登録完了！ログインしてください。',
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
    signupComplete: 'Registration completed! Please login.',
  },
  zh: {
    systemTitle: 'KOC 管理系统',
    points: '积分',
    loginPrompt: '请登录',
    login: '登录',
    logout: '退出',
    mainMenu: '主菜单',
    home: '主页',
    projectList: '案件列表',
    myPage: '我的页面',
    community: '社区',
    freeBoard: '自由讨论',
    lifeBoard: '日本生活问答',
    ranking: '排行榜',
    management: '管理',
    admin: '管理员',
    welcome: '欢迎！',
    totalPoints: '总积分',
    completedProjects: '已完成',
    contribution: '贡献度',
    overallRanking: '综合排名',
    popularProjects: '人气案件',
    trendingPosts: '本周趋势',
    apply: '申请',
    yen: '日元',
    cases: '件',
    rank: '位',
    allProjects: '全部案件',
    all: '全部',
    restaurant: '餐厅',
    hotel: '酒店',
    tourist: '旅游景点',
    others: '其他',
    filterSort: '筛选/排序',
    sortByPoints: '积分最高',
    sortByDeadline: '临近截止',
    filterByRegion: '按地区',
    addFavorite: '收藏',
    removeFavorite: '取消收藏',
    writePost: '发帖',
    titleLabel: '标题',
    contentLabel: '内容',
    imageUpload: '上传图片',
    postSubmit: '发布',
    cancel: '取消',
    views: '浏览',
    comments: '评论',
    search: '搜索',
    searchPlaceholder: '输入搜索词',
    sortLatest: '最新',
    sortPopular: '最热',
    sortComments: '评论最多',
    prevPage: '上一页',
    nextPage: '下一页',
    contributionRanking: '贡献度排行榜',
    rankingHeader: '排名',
    nickname: '昵称',
    nicknameLabel: '昵称',
    checkDuplicate: '重名检查',
    nicknameAvailable: '昵称可用',
    nicknameTaken: '昵称已被占用',
    enterNickname: '请输入昵称',
    contributionScore: '贡献度',
    completedCases: '完成数',
    earnedPoints: '获得积分',
    myPoints: '我的积分',
    myActivities: '我的活动',
    myProjects: '我的案件管理',
    submitResult: '提交成果',
    resultUrl: '成果 URL',
    submitUrl: '提交 URL',
    pendingReview: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    pending: '进行中',
    submitted: '已提交',
    requestRefund: '积分兑换申请',
    signup: '注册',
    id: '账号',
    password: '密码',
    passwordConfirm: '确认密码',
    email: '邮箱',
    phone: '电话',
    name: '姓名',
    activityPlatform: '活动平台',
    naverBlog: 'Naver 博客',
    youtube: 'YouTube',
    instagram: 'Instagram',
    residence: '居住地区',
    selectOption: '请选择',
    tokyo: '东京',
    osaka: '大阪',
    kyoto: '京都',
    privacyAgree: '同意收集并使用个人信息',
    termsAgree: '同意服务条款',
    memberManagement: '会员管理',
    projectManagement: '案件管理',
    statistics: '统计',
    exportData: '导出数据',
    registrationDate: '注册日期',
    manage: '管理',
    detail: '详情',
    deductPoints: '扣减积分',
    approveResult: '通过成果',
    rejectResult: '拒绝成果',
    exportToSpreadsheet: '导出到电子表格',
    totalMembers: '会员总数',
    activeProjects: '进行中案件',
    monthlyRevenue: '月收入',
    enterID: '请输入账号',
    enterPassword: '请输入密码',
    reenterPassword: '请再次输入密码',
    loginRequired: '需要登录！',
    urlSubmitted: 'URL 已提交。管理员审核后将发放积分。',
    pointsDeducted: '积分已扣减。',
    signupComplete: '注册完成！请登录。',
  }
} as const;

// 날짜 포맷
const formatDate = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

// 일주일 내 게시글인지 확인
const isWithinWeek = (dateStr: string) => {
  const postDate = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return postDate >= weekAgo;
};

export default function KOCManagementSystem() {
  const [language, setLanguage] = useState<Lang>('ko');
  const t = translations[language];
  
  // 로그인 관련
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 네비게이션
  const [activeMenu, setActiveMenu] = useState<string>('home');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  // 해시 라우팅(게시글 페이지 이동)
  const [readingBoard, setReadingBoard] = useState<'free'|'life'|null>(null);
  const [readPost, setReadPost] = useState<Post | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash; // #post/free/123
      const match = hash.match(/^#post\/(free|life)\/(\d+)$/);
      if (match) {
        const board = match[1] as 'free'|'life';
        const id = parseInt(match[2], 10);
        const src = board === 'free' ? freePostsRef.current : lifePostsRef.current;
        const found = src.find(p => p.id === id);
        if (found) {
          setReadingBoard(board);
          setReadPost(found);
          setActiveMenu('post'); // 별도의 “페이지”로 렌더
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // 게시글 배열 최신 참조(해시 진입 시 탐색 용)
  const [freePosts, setFreePosts] = useState<Post[]>([
    { id: 1, title: '오사카 맛집 추천해주세요!', author: 'user1', authorNickname: '여행러버', date: formatDate(new Date()), views: 234, comments: 12, content: '오사카 여행 예정입니다.' },
    { id: 2, title: '도쿄 호텔 체험 후기', author: 'user2', authorNickname: '호텔마니아', date: formatDate(new Date(Date.now() - 86400000)), views: 156, comments: 8, content: '정말 좋았어요!' },
  ]);
  const [lifePosts, setLifePosts] = useState<Post[]>([
    { id: 1, title: '도쿄 월세 정보', author: 'user3', authorNickname: '도쿄살이', date: formatDate(new Date()), views: 320, comments: 15, content: '도쿄 월세 정보 공유합니다.' },
  ]);
  const freePostsRef = React.useRef(freePosts);
  const lifePostsRef = React.useRef(lifePosts);
  useEffect(()=>{ freePostsRef.current = freePosts; },[freePosts]);
  useEffect(()=>{ lifePostsRef.current = lifePosts; },[lifePosts]);

  // 회원가입/로그인
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState<'none' | 'available' | 'taken'>('none');
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
      contribution: 99999
    }
  ]);
  
  // 프로젝트 관련
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, category: 'restaurant', title: '도쿄 라멘집 체험', location: '도쿄', desc: '맛있는 라멘 체험', points: 1000, deadline: '2024.12.31' },
    { id: 2, category: 'hotel', title: '오사카 호텔 숙박', location: '오사카', desc: '호텔 숙박 체험', points: 2000, deadline: '2024.12.25' },
    { id: 3, category: 'tourist', title: '교토 전통 체험', location: '교토', desc: '전통 문화 체험', points: 1500, deadline: '2024.12.20' },
    { id: 4, category: 'restaurant', title: '도쿄 스시 오마카세', location: '도쿄', desc: '고급 스시 체험', points: 2500, deadline: '2024.12.15' },
    { id: 5, category: 'hotel', title: '교토 료칸 숙박', location: '교토', desc: '전통 료칸 체험', points: 3000, deadline: '2024.12.10' },
  ]);
  const [projectTab, setProjectTab] = useState<Category | 'all'>('all');
  const [projectSort, setProjectSort] = useState<ProjectSort>('points');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  
  // 게시판 검색/정렬
  const [boardSearch, setBoardSearch] = useState('');
  const [boardSort, setBoardSort] = useState<SortType>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // 모달 상태
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('10:00'); // ★ 시간 상태
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeBoard, setWriteBoard] = useState<'free' | 'life' | null>(null);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeImage, setWriteImage] = useState<string>('');
  const [showReadModal, setShowReadModal] = useState(false); // 유지(페이지 전환으로 대체)
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedMyProject, setSelectedMyProject] = useState<MyProject | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');
  
  // 관리자 탭 + 안건 등록 폼
  const [adminTab, setAdminTab] = useState<TabType>('members');
  const [newProj, setNewProj] = useState<{
    category: Category;
    title: string;
    location: string;
    desc: string;
    points: number;
    deadline: string;
    image?: string;
  }>({
    category: 'restaurant',
    title: '',
    location: '도쿄',
    desc: '',
    points: 0,
    deadline: '',
    image: ''
  });
  
  // 로그인 처리
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const id = formData.get('loginId') as string;
    
    if (id === 'admin') {
      setIsAdmin(true);
      setCurrentUser(users[0]);
    } else {
      const user = users.find(u => u.id === id);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
      }
    }
    setIsLoggedIn(true);
    setActiveMenu('home');
  };
  
  // 회원가입 처리
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newUser: User = {
      id: formData.get('userId') as string,
      nickname: formData.get('nickname') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      platform: Array.from(formData.getAll('platform')) as string[],
      region: formData.get('region') as string,
      registrationDate: formatDate(new Date()),
      points: 0,
      contribution: 0
    };
    
    setUsers(prev => [...prev, newUser]);
    alert(t.signupComplete);
    setIsRegisterTab(false);
  };
  
  // 닉네임 중복 확인
  const checkNickname = (nickname: string) => {
    if (!nickname) return;
    const exists = users.some(u => u.nickname === nickname);
    setNicknameCheck(exists ? 'taken' : 'available');
  };
  
  // 로그아웃
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setMyProjects([]);
  };
  
  // 프로젝트 신청(기존 예약 → 신청)
  const openReservation = (project: Project) => {
    if (!isLoggedIn) {
      alert(t.loginRequired);
      setActiveMenu('login');
      return;
    }
    setSelectedProject(project);
    setSelectedDate(null);
    setSelectedTime('10:00');
    setShowReservationModal(true);
  };
  
  const confirmReservation = () => {
    if (!selectedDate || !selectedProject || !currentUser) {
      alert('날짜를 선택하세요');
      return;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(selectedDate).padStart(2, '0')}`;
    const newProject: MyProject = {
      id: myProjects.length + 1,
      projectName: selectedProject.title,
      date: dateStr,
      points: selectedProject.points,
      status: 'pending',
      userId: currentUser.id,     // ★ 신청자 연결
      time: selectedTime,         // ★ 시간 저장
    };
    
    setMyProjects(prev => [...prev, newProject]);
    alert(`신청 완료!\n${selectedProject.title}\n${dateStr} ${selectedTime}`);
    setShowReservationModal(false);
    setSelectedDate(null);
  };
  
  // URL 제출
  const handleUrlSubmit = () => {
    if (!selectedMyProject || !submitUrl) return;
    
    setMyProjects(prev => prev.map(p => 
      p.id === selectedMyProject.id 
        ? { ...p, status: 'submitted' as const, resultUrl: submitUrl }
        : p
    ));
    
    alert(t.urlSubmitted);
    setShowUrlModal(false);
    setSubmitUrl('');
  };
  
  // 관리자: 결과 승인
  const approveResult = (projectId: number, userId: string) => {
    const project = myProjects.find(p => p.id === projectId);
    if (!project) return;
    
    setMyProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'approved' as const } : p
    ));
    
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, points: u.points + project.points, contribution: u.contribution + 50 }
        : u
    ));
    
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, points: prev.points + project.points, contribution: prev.contribution + 50 } : null);
    }
  };
  
  // 관리자: 포인트 차감
  const deductPoints = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, points: Math.max(0, u.points - amount) } : u
    ));
    
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, points: Math.max(0, prev.points - amount) } : null);
    }
    
    alert(t.pointsDeducted);
  };
  
  // 글쓰기
  const openWrite = (board: 'free' | 'life') => {
    if (!isLoggedIn) {
      alert(t.loginRequired);
      setActiveMenu('login');
      return;
    }
    setWriteBoard(board);
    setWriteTitle('');
    setWriteContent('');
    setWriteImage('');
    setShowWriteModal(true);
  };
  
  const submitWrite = () => {
    if (!writeBoard || !currentUser) return;
    
    const newPost: Post = {
      id: (writeBoard === 'free' ? freePosts : lifePosts).length + 1,
      title: writeTitle || '제목 없음',
      author: currentUser.id,
      authorNickname: currentUser.nickname,
      date: formatDate(new Date()),
      views: 0,
      comments: 0,
      content: writeContent,
      image: writeImage
    };
    
    if (writeBoard === 'free') {
      setFreePosts(prev => [newPost, ...prev]);
    } else {
      setLifePosts(prev => [newPost, ...prev]);
    }
    
    setShowWriteModal(false);
  };
  
  // 게시글 정렬
  const sortPosts = (posts: Post[]) => {
    const filtered = posts.filter(p => 
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
  
  // 트렌딩 게시글 (일주일 내 조회수 + 댓글)
  const getTrendingPosts = (posts: Post[]) => {
    return posts
      .filter(p => isWithinWeek(p.date))
      .sort((a, b) => (b.views + b.comments * 2) - (a.views + a.comments * 2))
      .slice(0, 3);
  };
  
  // 프로젝트 정렬
  const sortProjects = (projects: Project[]) => {
    let sorted = [...projects];
    
    if (selectedRegion !== 'all') {
      sorted = sorted.filter(p => p.location.includes(selectedRegion));
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
  
  // 즐겨찾기 토글
  const toggleFavorite = (projectId: number) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // 게시글 “페이지” 열기(해시 이동)
  const openPostPage = (board: 'free'|'life', post: Post) => {
    setReadingBoard(board);
    setReadPost(post);
    window.location.hash = `#post/${board}/${post.id}`;
  };
  
  // 데이터 내보내기
  const exportData = () => {
    const data = {
      users: users,
      projects: projects,
      posts: [...freePosts, ...lifePosts],
      exportDate: formatDate(new Date())
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
  
  // 렌더링
  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        const trendingFree = getTrendingPosts(freePosts);
        const trendingLife = getTrendingPosts(lifePosts);
        
        return (
          <>
            <div className="content-header">
              <h2>{t.welcome} {currentUser?.nickname}님! 👋</h2>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="stat-label">{t.totalPoints}</div>
                <div className="stat-number">{currentUser?.points.toLocaleString() || 0}{t.yen}</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className="stat-label">{t.completedProjects}</div>
                <div className="stat-number">{myProjects.filter(p => p.status === 'approved').length}{t.cases}</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div className="stat-label">{t.contribution}</div>
                <div className="stat-number">{currentUser?.contribution || 0}</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <div className="stat-label">{t.overallRanking}</div>
                <div className="stat-number">
                  {users.findIndex(u => u.id === currentUser?.id) + 1 || '-'}{t.rank}
                </div>
              </div>
            </div>
            
            <h3 style={{ marginTop: '30px' }}>🔥 {t.popularProjects}</h3>
            <div className="project-grid">
              {projects.slice(0, 3).map(project => (
                <div key={project.id} className="project-card">
                  {project.image && <img src={project.image} alt="" className="project-image" />}
                  <div className="project-header">
                    <span className="project-type">{t[project.category as keyof typeof t] || project.category}</span>
                    <button 
                      className="favorite-btn"
                      onClick={() => toggleFavorite(project.id)}
                    >
                      {project.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-location">📍 {project.location}</p>
                  <p className="project-deadline">⏰ {project.deadline}</p>
                  <div className="project-points">💰 {project.points.toLocaleString()}{t.yen}</div>
                  <button className="apply-btn" onClick={() => openReservation(project)}>
                    {t.apply}
                  </button>
                </div>
              ))}
            </div>
            
            <h3 style={{ marginTop: '30px' }}>📈 {t.trendingPosts} (자유게시판)</h3>
            <div className="post-list">
              {trendingFree.map(post => (
                <div key={post.id} className="post-item" onClick={() => openPostPage('free', post)}>
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
        
      case 'projects':
        const sortedProjects = sortProjects(projectTab === 'all' ? projects : projects.filter(p => p.category === projectTab));
        const favoriteProjects = sortedProjects.filter(p => p.isFavorite);
        const regularProjects = sortedProjects.filter(p => !p.isFavorite);
        const displayProjects = [...favoriteProjects, ...regularProjects];
        
        return (
          <>
            <div className="content-header">
              <h2>📋 {t.allProjects}</h2>
            </div>
            
            <div className="filter-section">
              <div className="tabs">
                {(['all', 'restaurant', 'hotel', 'tourist', 'others'] as const).map(tab => (
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
              {displayProjects.map(project => (
                <div key={project.id} className={`project-card ${project.isFavorite ? 'favorite' : ''}`}>
                  {project.image && <img src={project.image} alt="" className="project-image" />}
                  <div className="project-header">
                    <span className="project-type">{t[project.category as keyof typeof t]}</span>
                    <button 
                      className="favorite-btn"
                      onClick={() => toggleFavorite(project.id)}
                    >
                      {project.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-location">📍 {project.location}</p>
                  <p className="project-deadline">⏰ {project.deadline}</p>
                  <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>{project.desc}</p>
                  <div className="project-points">💰 {project.points.toLocaleString()}{t.yen}</div>
                  <button className="apply-btn" onClick={() => openReservation(project)}>
                    {t.apply}
                  </button>
                </div>
              ))}
            </div>
          </>
        );
        
      case 'board':
      case 'life':
        const posts = activeMenu === 'board' ? freePosts : lifePosts;
        const sortedPosts = sortPosts(posts);
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
        const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
        
        return (
          <>
            <div className="content-header">
              <h2>{activeMenu === 'board' ? '💬 ' + t.freeBoard : '💡 ' + t.lifeBoard}</h2>
            </div>
            
            <div className="board-controls">
              <button 
                className="apply-btn" 
                style={{ width: 'auto' }}
                onClick={() => openWrite(activeMenu as 'free' | 'life')}
              >
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
              {currentPosts.map(post => (
                <div 
                  key={post.id} 
                  className="post-item"
                  onClick={() => openPostPage(activeMenu === 'board' ? 'free' : 'life', post)}
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
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  {t.prevPage}
                </button>
                
                <span className="page-info">{currentPage} / {totalPages}</span>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  {t.nextPage}
                </button>
              </div>
            )}
          </>
        );

      case 'post': {
        if (!readPost) return null;
        const backTo = readingBoard === 'life' ? 'life' : 'board';
        return (
          <>
            <div className="content-header">
              <h2>{readingBoard === 'life' ? '💡 ' + t.lifeBoard : '💬 ' + t.freeBoard}</h2>
            </div>
            <div style={{marginBottom: 16}}>
              <button className="page-btn" onClick={() => { window.history.back(); }}>
                ← 목록으로
              </button>
            </div>
            <h2 style={{marginBottom: 8}}>{readPost.title}</h2>
            <div className="post-meta" style={{marginBottom: 16}}>
              {readPost.authorNickname} | {readPost.date} | {t.views} {readPost.views} | {t.comments} {readPost.comments}
            </div>
            <div style={{whiteSpace:'pre-wrap', color:'#1f2937'}}>{readPost.content}</div>
            {readPost.image && <img src={readPost.image} style={{maxWidth:'100%',marginTop:16,borderRadius:6}} alt="" />}
          </>
        );
      }
        
      case 'ranking':
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
                      <span className={`rank-medal ${idx < 3 ? `rank-${idx + 1}` : ''}`}>
                        {idx + 1}
                      </span>
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
        
      case 'mypage':
        if (!isLoggedIn || !currentUser) {
          alert(t.loginRequired);
          setActiveMenu('login');
          return null;
        }
        const mine = myProjects.filter(p => p.userId === currentUser.id); // ★ 내 신청만
        return (
          <>
            <div className="content-header">
              <h2>👤 {t.myPage}</h2>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="stat-label">{t.myPoints}</div>
                <div className="stat-number">{currentUser.points.toLocaleString()}{t.yen}</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className="stat-label">{t.contribution}</div>
                <div className="stat-number">{currentUser.contribution}</div>
              </div>
            </div>
            
            <h3 style={{ marginTop: '30px' }}>{t.myProjects}</h3>
            <div className="project-status-list">
              {mine.map(project => (
                <div key={project.id} className="project-status-item">
                  <div className="project-status-info">
                    <div className="project-status-title">{project.projectName}</div>
                    <div className="project-status-meta">
                      {project.date}{project.time ? ` ${project.time}` : ''} | {project.points}{t.yen} | 
                      <span className={`status-badge status-${project.status}`}>
                        {t[project.status]}
                      </span>
                    </div>
                    {project.resultUrl && (
                      <div className="project-url">URL: {project.resultUrl}</div>
                    )}
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
              <button className="submit-btn" style={{ marginTop: '20px' }}>
                {t.requestRefund}
              </button>
            )}
          </>
        );
        
      case 'login':
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
                    <input 
                      type="text" 
                      name="nickname" 
                      placeholder={t.enterNickname}
                      required 
                    />
                    <button 
                      type="button"
                      className="check-btn"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) checkNickname(input.value);
                      }}
                    >
                      {t.checkDuplicate}
                    </button>
                  </div>
                  {nicknameCheck === 'available' && (
                    <div className="check-message success">{t.nicknameAvailable}</div>
                  )}
                  {nicknameCheck === 'taken' && (
                    <div className="check-message error">{t.nicknameTaken}</div>
                  )}
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
        
      case 'admin':
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
              {(['members', 'projects', 'statistics', 'export'] as TabType[]).map(tab => (
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
                  {users.map(user => (
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
                <h3 style={{marginBottom:12}}>안건 등록</h3>
                <div className="admin-project-form">
                  <div className="form-row">
                    <label>카테고리</label>
                    <select value={newProj.category} onChange={e=>setNewProj(p=>({...p, category: e.target.value as Category}))}>
                      <option value="restaurant">{t.restaurant}</option>
                      <option value="hotel">{t.hotel}</option>
                      <option value="tourist">{t.tourist}</option>
                      <option value="others">{t.others}</option>
                    </select>
                  </div>
                  <div className="form-row"><label>{t.titleLabel}</label><input value={newProj.title} onChange={e=>setNewProj(p=>({...p, title:e.target.value}))} /></div>
                  <div className="form-row"><label>지역</label><input value={newProj.location} onChange={e=>setNewProj(p=>({...p, location:e.target.value}))} /></div>
                  <div className="form-row"><label>{t.contentLabel}</label><input value={newProj.desc} onChange={e=>setNewProj(p=>({...p, desc:e.target.value}))} /></div>
                  <div className="form-row"><label>포인트</label><input type="number" value={newProj.points} onChange={e=>setNewProj(p=>({...p, points:parseInt(e.target.value||'0')}))} /></div>
                  <div className="form-row"><label>마감일(YYYY.MM.DD)</label><input value={newProj.deadline} onChange={e=>setNewProj(p=>({...p, deadline:e.target.value}))} /></div>
                  <div className="form-row">
                    <label>{t.imageUpload}</label>
                    <input type="file" accept="image/*" onChange={(e)=>{
                      const f = e.target.files?.[0]; if(!f) return;
                      const r = new FileReader(); r.onload = ev => setNewProj(p=>({...p, image: ev.target?.result as string}));
                      r.readAsDataURL(f);
                    }}/>
                    {newProj.image && <img src={newProj.image} alt="preview" style={{maxWidth:200, marginTop:8, borderRadius:6}}/>}
                  </div>
                  <button className="submit-btn" style={{width:'auto'}} onClick={()=>{
                    if(!newProj.title) return alert('제목을 입력하세요');
                    const item: Project = { id: Date.now(), ...newProj };
                    setProjects(prev=>[item, ...prev]);
                    alert('안건이 등록되었습니다.');
                    setNewProj({category:'restaurant', title:'', location:'도쿄', desc:'', points:0, deadline:'', image:''});
                  }}>안건 등록</button>
                </div>

                <h3 style={{marginTop:24}}>제출된 결과물 관리</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>프로젝트</th>
                      <th>사용자</th>
                      <th>제출 URL</th>
                      <th>상태</th>
                      <th>포인트</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProjects.filter(p => p.status === 'submitted').map(project => {
                      const owner = users.find(u=>u.id===project.userId);
                      return (
                        <tr key={project.id}>
                          <td>{project.projectName}</td>
                          <td>{owner?.nickname || project.userId}</td>
                          <td>{project.resultUrl}</td>
                          <td>{t[project.status]}</td>
                          <td>{project.points}</td>
                          <td>
                            <button 
                              className="admin-btn approve"
                              onClick={() => approveResult(project.id, project.userId)}
                            >
                              {t.approveResult}
                            </button>
                            <button 
                              className="admin-btn reject"
                              onClick={() => {
                                setMyProjects(prev => prev.map(p => 
                                  p.id === project.id ? { ...p, status: 'rejected' as const } : p
                                ));
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
              </div>
            )}
            
            {adminTab === 'statistics' && (
              <div className="statistics">
                <div className="stats-grid">
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="stat-label">{t.totalMembers}</div>
                    <div className="stat-number">{users.length}</div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <div className="stat-label">{t.activeProjects}</div>
                    <div className="stat-number">{projects.length}</div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
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
        
      default:
        return null;
    }
  };
  
  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif;
          background: #f4f5f7;
          min-height: 100vh;
          color:#1f2937;            /* ★ 본문색 강화 */
          line-height:1.6;          /* ★ 가독성 */
          -webkit-font-smoothing: antialiased;      /* ★ 스무딩 */
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-size:16px;
        }
        ::placeholder{ color:#6b7280 }               /* ★ 플레이스홀더 대비 */
        
        header {
          background: #03c75a;
          color: white;
          padding: 15px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 800;         /* ★ 제목 가중치 */
          cursor: pointer;
          letter-spacing:.2px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .lang-selector {
          position: relative;
        }
        
        .lang-btn {
          padding: 6px 12px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        }
        
        .lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 1000;
          overflow:hidden;
        }
        
        .lang-option {
          padding: 10px 20px;
          cursor: pointer;
          color: #111827;
          border-bottom: 1px solid #f3f4f6;
        }
        .lang-option:last-child { border-bottom:0 }
        .lang-option:hover { background: #f0f0f0; }
        
        .points-badge {
          background: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
        }
        
        .main-container {
          max-width: 1200px;
          margin: 20px auto;
          padding: 0 20px;
          display: flex;
          gap: 20px;
        }
        
        .sidebar {
          width: 200px;
          background: white;
          border-radius: 8px;
          padding: 20px;
          height: fit-content;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .menu-category {
          font-size: 12px;
          color: #6b7280;           /* ★ 회색 톤 보정 */
          margin: 15px 0 5px 5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing:.5px;
        }
        
        .menu-item {
          padding: 12px 15px;
          margin: 5px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color:#111827;            /* ★ 메뉴 대비 */
        }
        .menu-item:hover { background: #f0f0f0; }
        .menu-item.active { background: #03c75a; color: white; }
        
        .content {
          flex: 1;
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .content-header {
          border-bottom: 2px solid #03c75a;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .content-header h2 {
          color: #111827;           /* ★ 헤더 제목 대비 */
          font-weight:800;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        
        .stat-card {
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: 800;         /* ★ 숫자 굵게 */
          margin: 10px 0;
        }
        
        .stat-label {
          font-size: 14px;
          opacity: .95;
        }
        
        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .project-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
          position: relative;
          background:#fff;
        }
        
        .project-card.favorite {
          border-color: #ffd700;
          background: #fffef5;
        }
        
        .project-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        
        .project-image{
          width:100%;
          height:160px;
          object-fit:cover;
          border-radius:10px;
          margin-bottom:10px;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .project-type {
          display: inline-block;
          padding: 4px 8px;
          background: #e7f5ff;
          color: #0c8599;
          border-radius: 6px;
          font-size: 12px;
          font-weight:700;
        }
        
        .favorite-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
        
        .project-title {
          font-size: 18px;
          margin-bottom: 10px;
          color: #111827;
          font-weight:800;
        }
        
        .project-location, .project-deadline {
          color: #4b5563;           /* ★ 더 진한 메타 */
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .project-points {
          color: #059669;
          font-weight: 800;
          margin-top: 10px;
        }
        
        .apply-btn {
          width: 100%;
          padding: 10px;
          background: #03c75a;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 15px;
          font-size: 14px;
          transition: background 0.2s;
          font-weight:700;
        }
        
        .apply-btn:hover { background: #02b351; }
        
        .filter-section { margin-bottom: 20px; }
        
        .filter-controls {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          color:#111827;
        }
        
        .board-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .search-sort { display: flex; gap: 10px; }
        
        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 200px;
          color:#111827;
        }
        
        .post-list { margin-top: 20px; }
        
        .post-item {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.2s;
        }
        .post-item:hover { background: #f8f9fa; }
        
        .post-title {
          font-size: 16px;
          color: #111827;
          margin-bottom: 5px;
          font-weight:700;
        }
        
        .post-meta { font-size: 13px; color: #4b5563; }  /* ★ 메타 색 */
        
        .post-badge {
          display: inline-block;
          padding: 2px 6px;
          background: #ff6b6b;
          color: white;
          border-radius: 999px;
          font-size: 11px;
          margin-left: 6px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        
        .page-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color:#111827;
        }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-info { color: #4b5563; }
        
        .ranking-table, .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .ranking-table th, .admin-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .ranking-table td, .admin-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color:#111827;
        }
        
        .rank-medal {
          display: inline-block;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          text-align: center;
          line-height: 25px;
          font-weight: 800;
          color: white;
          font-size: 12px;
        }
        .rank-1 { background: gold; color: #333; }
        .rank-2 { background: silver; color: #333; }
        .rank-3 { background: #cd7f32; }
        
        .project-status-list { margin-top: 20px; }
        
        .project-status-item {
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background:#fff;
        }
        
        .project-status-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 5px;
          color:#111827;
        }
        
        .project-status-meta { font-size: 13px; color: #4b5563; }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          margin-left: 10px;
          font-weight:700;
        }
        .status-pending { background: #fde68a; color:#7c3e00 }
        .status-submitted { background: #93c5fd; color: #0b3c7a; }
        .status-approved { background: #86efac; color: #065f46; }
        .status-rejected { background: #fca5a5; color:#7f1d1d; }
        
        .project-url { font-size: 12px; color: #0066cc; margin-top: 5px; }
        .submit-url-btn {
          padding: 8px 16px;
          background: #03c75a;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight:700;
        }
        
        .auth-container { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #111827;           /* ★ 레이블 대비 */
          font-size: 14px;
          font-weight:700;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color:#111827;
        }
        
        .input-with-button { display: flex; gap: 10px; }
        .input-with-button input { flex: 1; }
        
        .check-btn {
          padding: 10px 20px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .check-message { margin-top: 5px; font-size: 12px; }
        .check-message.success { color: #16a34a; }
        .check-message.error { color: #dc2626; }
        
        .checkbox-list { display: flex; flex-direction: column; gap: 10px; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .checkbox-item input { width: auto; }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #03c75a;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
          font-weight:800;
        }
        .submit-btn:hover { background: #02b351; }
        
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .tab {
          padding: 10px 20px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          border-radius: 6px 6px 0 0;
          color:#111827;
        }
        .tab:hover { background: #f8f9fa; }
        .tab.active { border-bottom-color: #03c75a; color: #03c75a; background:#f8fff9 }
        
        .admin-btn {
          padding: 6px 10px;
          margin: 0 2px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: white;
        }
        .admin-btn { background: #6b7280; }
        .admin-btn.approve { background: #16a34a; }
        .admin-btn.reject { background: #dc2626; }
        
        .export-section { padding: 20px; }
        .export-section h3 { margin-bottom: 10px; }
        .export-section p { color: #4b5563; margin-bottom: 20px; }

        /* 관리자 안건 등록 폼 */
        .admin-project-form{
          display:grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap:12px;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:16px;
          background:#fff;
          margin-bottom:16px;
        }
        .form-row{ display:flex; flex-direction:column; gap:6px; }
        .form-row input, .form-row select{
          padding:10px; border:1px solid #d1d5db; border-radius:8px; color:#111827;
        }
        
        .modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow:0 10px 30px rgba(0,0,0,.15);
        }
        
        .modal-close {
          float: right;
          font-size: 24px;
          cursor: pointer;
          color: #9ca3af;
        }
        .modal-close:hover { color: #111827; }
        
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin: 20px 0;
        }
        .calendar-day {
          padding: 10px;
          text-align: center;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
          border-radius:8px;
          color:#111827;
        }
        .calendar-day:hover { background: #f0f0f0; }
        .calendar-day.selected { background: #03c75a; color: white; }
        
        .image-upload-area {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          margin-top: 10px;
        }
        .image-upload-area:hover { background: #f8f9fa; }
        .image-preview { max-width: 100%; margin-top: 10px; border-radius: 8px; }
        
        @media (max-width: 768px) {
          .main-container { flex-direction: column; }
          .sidebar { width: 100%; }
          .project-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      <header>
        <div className="header-content">
          <div className="logo" onClick={() => { setActiveMenu('home'); window.location.hash=''; }}>
            🌟 {t.systemTitle}
          </div>
          
          <div className="user-info">
            <div className="lang-selector">
              <button className="lang-btn" onClick={() => setShowLangDropdown(!showLangDropdown)}>
                🌐 {language.toUpperCase()} ▼
              </button>
              {showLangDropdown && (
                <div className="lang-dropdown">
                  <div className="lang-option" onClick={() => { setLanguage('ko'); setShowLangDropdown(false); }}>
                    🇰🇷 한국어
                  </div>
                  <div className="lang-option" onClick={() => { setLanguage('ja'); setShowLangDropdown(false); }}>
                    🇯🇵 日本語
                  </div>
                  <div className="lang-option" onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}>
                    🇺🇸 English
                  </div>
                  <div className="lang-option" onClick={() => { setLanguage('zh'); setShowLangDropdown(false); }}>
                    🇨🇳 简体中文
                  </div>
                </div>
              )}
            </div>
            
            {isLoggedIn && currentUser && (
              <div className="points-badge">
                💰 {t.points}: {currentUser.points.toLocaleString()}{t.yen}
              </div>
            )}
            
            <span>
              {isLoggedIn && currentUser ? `${currentUser.nickname}님` : t.loginPrompt}
            </span>
            
            <button
              onClick={isLoggedIn ? handleLogout : () => setActiveMenu('login')}
              style={{
                padding: '8px 16px',
                background: 'white',
                color: '#03c75a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight:700
              }}
            >
              {isLoggedIn ? t.logout : t.login}
            </button>
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <aside className="sidebar">
          <div className="menu-category">{t.mainMenu}</div>
          <div className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`} onClick={() => { setActiveMenu('home'); window.location.hash=''; }}>
            🏠 {t.home}
          </div>
          <div className={`menu-item ${activeMenu === 'projects' ? 'active' : ''}`} onClick={() => { setActiveMenu('projects'); window.location.hash=''; }}>
            📋 {t.projectList}
          </div>
          <div className={`menu-item ${activeMenu === 'mypage' ? 'active' : ''}`} onClick={() => { setActiveMenu('mypage'); window.location.hash=''; }}>
            👤 {t.myPage}
          </div>
          
          <div className="menu-category">{t.community}</div>
          <div className={`menu-item ${activeMenu === 'board' ? 'active' : ''}`} onClick={() => { setActiveMenu('board'); window.location.hash=''; }}>
            💬 {t.freeBoard}
          </div>
          <div className={`menu-item ${activeMenu === 'life' ? 'active' : ''}`} onClick={() => { setActiveMenu('life'); window.location.hash=''; }}>
            💡 {t.lifeBoard}
          </div>
          <div className={`menu-item ${activeMenu === 'ranking' ? 'active' : ''}`} onClick={() => { setActiveMenu('ranking'); window.location.hash=''; }}>
            🏆 {t.ranking}
          </div>
          
          <div className="menu-category">{t.management}</div>
          <div className={`menu-item ${activeMenu === 'admin' ? 'active' : ''}`} onClick={() => { setActiveMenu('admin'); window.location.hash=''; }}>
            ⚙️ {t.admin}
          </div>
        </aside>
        
        <main className="content">
          {renderContent()}
        </main>
      </div>
      
      {/* 신청 모달(텍스트/버튼 변경) */}
      {showReservationModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowReservationModal(false)}>&times;</span>
            <h2>안건 신청</h2>
            
            <div className="form-group">
              <label>안건명</label>
              <input type="text" value={selectedProject?.title || ''} readOnly />
            </div>
            
            <div className="form-group">
              <label>희망 날짜 선택</label>
              <div className="calendar">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
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
              <label>희망 시간</label>
              <select value={selectedTime} onChange={(e)=>setSelectedTime(e.target.value)}>
                <option>10:00</option>
                <option>11:00</option>
                <option>12:00</option>
                <option>13:00</option>
                <option>14:00</option>
                <option>15:00</option>
                <option>16:00</option>
                <option>17:00</option>
                <option>18:00</option>
              </select>
            </div>
            
            <button className="submit-btn" onClick={confirmReservation}>
              신청
            </button>
          </div>
        </div>
      )}
      
      {/* 글쓰기 모달(이미지 업로드 유지) */}
      {showWriteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowWriteModal(false)}>&times;</span>
            <h2>{writeBoard === 'free' ? t.freeBoard : t.lifeBoard} - {t.writePost}</h2>
            
            <div className="form-group">
              <label>{t.titleLabel}</label>
              <input 
                type="text"
                value={writeTitle}
                onChange={(e) => setWriteTitle(e.target.value)}
                placeholder={t.titleLabel}
              />
            </div>
            
            <div className="form-group">
              <label>{t.contentLabel}</label>
              <textarea
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
                placeholder={t.contentLabel}
                rows={6}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', color:'#111827' }}
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
                      reader.onload = (e) => setWriteImage(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {writeImage && <img src={writeImage} className="image-preview" alt="Preview" />}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="submit-btn" onClick={submitWrite} style={{ width: 'auto', padding: '10px 20px' }}>
                {t.postSubmit}
              </button>
              <button 
                className="tab"
                style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setShowWriteModal(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 글 읽기 모달(미사용: 페이지 이동으로 대체) */}
      {false && showReadModal && readPost && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => {}}>&times;</span>
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
              <label>프로젝트명</label>
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
    </>
  );
}
