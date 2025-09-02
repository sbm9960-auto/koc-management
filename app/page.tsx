'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  Lang, Category, SortType, ProjectSort, TabType,
  User, Project, Post, MyProject
} from '@/lib/types';
import { translations } from '@/lib/i18n';
import { getLS, setLS, LS, seedIfEmpty, today } from '@/lib/storage';

// 공통 유틸
const isWithinWeek = (dateStr: string) => {
  const postDate = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return postDate >= weekAgo;
};

export default function KOCManagementSystem() {
  const router = useRouter();
  const sp = useSearchParams();

  // 초기 시드
  useEffect(() => {
    seedIfEmpty();
  }, []);

  // 언어
  const [language, setLanguage] = useState<Lang>('ko');
  useEffect(() => {
    const saved = getLS<Lang>(LS.lang, 'ko');
    setLanguage(saved);
  }, []);
  useEffect(() => { setLS(LS.lang, language); }, [language]);
  const t = translations[language];

  // 인증/유저
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsLoggedIn(getLS<boolean>(LS.isLoggedIn, false));
    setCurrentUser(getLS<User | null>(LS.currentUser, null));
    setUsers(getLS<User[]>(LS.users, []));
  }, []);
  useEffect(() => { setLS(LS.isLoggedIn, isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { setLS(LS.currentUser, currentUser); }, [currentUser]);
  useEffect(() => { setLS(LS.users, users); }, [users]);

  useEffect(() => {
    setIsAdmin(currentUser?.id === 'admin');
  }, [currentUser]);

  // 네비
  const [activeMenu, setActiveMenu] = useState<string>('home');
  useEffect(() => {
    const backTo = sp.get('menu');
    if (backTo) setActiveMenu(backTo);
  }, [sp]);

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // 회원가입/로그인
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState<'none' | 'available' | 'taken'>('none');

  // 프로젝트
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTab, setProjectTab] = useState<Category | 'all'>('all');
  const [projectSort, setProjectSort] = useState<ProjectSort>('points');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);

  useEffect(() => {
    setProjects(getLS<Project[]>(LS.projects, []));
    setMyProjects(getLS<MyProject[]>(LS.myProjects, []));
  }, []);
  useEffect(() => { setLS(LS.projects, projects); }, [projects]);
  useEffect(() => { setLS(LS.myProjects, myProjects); }, [myProjects]);

  // 게시판
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [lifePosts, setLifePosts] = useState<Post[]>([]);
  useEffect(() => {
    setFreePosts(getLS<Post[]>(LS.postsFree, []));
    setLifePosts(getLS<Post[]>(LS.postsLife, []));
  }, []);
  useEffect(() => { setLS(LS.postsFree, freePosts); }, [freePosts]);
  useEffect(() => { setLS(LS.postsLife, lifePosts); }, [lifePosts]);

  const [boardSearch, setBoardSearch] = useState('');
  const [boardSort, setBoardSort] = useState<SortType>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 모달
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeBoard, setWriteBoard] = useState<'free' | 'life' | null>(null);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeImage, setWriteImage] = useState<string>('');
  const [showReadModal, setShowReadModal] = useState(false); // 유지 (홈 미리보기)
  const [readPost, setReadPost] = useState<Post | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedMyProject, setSelectedMyProject] = useState<MyProject | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');

  // 관리자 탭
  const [adminTab, setAdminTab] = useState<TabType>('members');

  // 로그인 처리
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = (formData.get('loginId') as string) || '';

    const found = users.find((u) => u.id === id);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      setIsAdmin(found.id === 'admin');
      setActiveMenu('home');
    } else {
      if (id === 'admin') {
        // 시드에 이미 admin 존재
        const adminU = getLS<User[]>(LS.users, []).find(u => u.id === 'admin')!;
        setCurrentUser(adminU);
        setIsLoggedIn(true);
        setIsAdmin(true);
        setActiveMenu('home');
      } else {
        alert('존재하지 않는 아이디입니다.');
      }
    }
  };

  // 회원가입 처리
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: (formData.get('userId') as string) || '',
      nickname: (formData.get('nickname') as string) || '',
      name: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      platform: Array.from(formData.getAll('platform')) as string[],
      region: (formData.get('region') as string) || '',
      registrationDate: today(),
      points: 0,
      contribution: 0,
    };

    if (users.some(u => u.id === newUser.id)) {
      alert('이미 존재하는 아이디입니다.');
      return;
    }

    setUsers((prev) => {
      const next = [...prev, newUser];
      return next;
    });
    // 자동 로그인 유지
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setIsAdmin(false);
    alert(translations[language].signupComplete);
    setIsRegisterTab(false);
    setActiveMenu('home');
  };

  // 닉네임 중복 확인
  const checkNickname = (nickname: string) => {
    if (!nickname) return;
    const exists = users.some((u) => u.nickname === nickname);
    setNicknameCheck(exists ? 'taken' : 'available');
  };

  // 로그아웃
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setMyProjects([]);
  };

  // 프로젝트 신청(예약 확정 → 신청으로 텍스트 변경)
  const openReservation = (project: Project) => {
    if (!isLoggedIn || !currentUser) {
      alert(translations[language].loginRequired);
      setActiveMenu('login');
      return;
    }
    setSelectedProject(project);
    setShowReservationModal(true);
  };

  const confirmReservation = () => {
    if (!selectedDate || !selectedProject || !currentUser) return;

    const newProject: MyProject = {
      id: myProjects.length + 1,
      projectName: selectedProject.title,
      date: `2024.12.${selectedDate}`,
      points: selectedProject.points,
      status: 'pending',
    };

    const next = [...myProjects, newProject];
    setMyProjects(next);
    alert(`신청 완료!\n${selectedProject.title}\n2024.12.${selectedDate}`);
    setShowReservationModal(false);
    setSelectedDate(null);
  };

  // URL 제출
  const handleUrlSubmit = () => {
    if (!selectedMyProject || !submitUrl) return;
    setMyProjects((prev) =>
      prev.map((p) => (p.id === selectedMyProject.id ? { ...p, status: 'submitted' as const, resultUrl: submitUrl } : p)),
    );
    alert(translations[language].urlSubmitted);
    setShowUrlModal(false);
    setSubmitUrl('');
  };

  // 관리자: 결과 승인
  const approveResult = (projectId: number, userId: string) => {
    const project = myProjects.find((p) => p.id === projectId);
    if (!project) return;

    setMyProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'approved' as const } : p)));

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, points: u.points + project.points, contribution: u.contribution + 50 } : u)),
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, points: prev.points + project.points, contribution: prev.contribution + 50 } : null,
      );
    }
  };

  // 관리자: 포인트 차감
  const deductPoints = (userId: string, amount: number) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, points: Math.max(0, u.points - amount) } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, points: Math.max(0, prev.points - amount) } : null));
    }
    alert(translations[language].pointsDeducted);
  };

  // 글쓰기
  const openWrite = (board: 'free' | 'life') => {
    if (!isLoggedIn) {
      alert(translations[language].loginRequired);
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

    const currentList = writeBoard === 'free' ? freePosts : lifePosts;
    const newPost: Post = {
      id: (currentList.length ? Math.max(...currentList.map(p => p.id)) : 0) + 1,
      board: writeBoard,
      title: writeTitle || '제목 없음',
      author: currentUser.id,
      authorNickname: currentUser.nickname,
      date: today(),
      views: 0,
      comments: 0,
      content: writeContent,
      image: writeImage,
    };

    if (writeBoard === 'free') {
      const next = [newPost, ...freePosts];
      setFreePosts(next);
    } else {
      const next = [newPost, ...lifePosts];
      setLifePosts(next);
    }

    setShowWriteModal(false);
    // 방금 쓴 글 상세로 이동
    router.push(`/${writeBoard}/${newPost.id}`);
  };

  // 검색/정렬
  const sortPosts = (posts: Post[]) => {
    const filtered = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(boardSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(boardSearch.toLowerCase()),
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

  // 트렌딩
  const getTrendingPosts = (posts: Post[]) => {
    return posts
      .filter((p) => isWithinWeek(p.date))
      .sort((a, b) => b.views + b.comments * 2 - (a.views + a.comments * 2))
      .slice(0, 3);
  };

  // 프로젝트 정렬
  const sortProjects = (list: Project[]) => {
    let sorted = [...list];
    if (selectedRegion !== 'all') sorted = sorted.filter((p) => p.location.includes(selectedRegion));
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
      exportDate: today(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koc-data-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 렌더링 핼퍼
  const HomeSection = () => {
    const trendingFree = useMemo(() => getTrendingPosts(freePosts), [freePosts]);

    return (
      <>
        <div className="content-header">
          <h2>
            {t.welcome} {currentUser?.nickname ?? ''} 👋
          </h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="stat-label">{t.totalPoints}</div>
            <div className="stat-number">{(currentUser?.points ?? 0).toLocaleString()}{t.yen}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="stat-label">{t.completedProjects}</div>
            <div className="stat-number">{myProjects.filter((p) => p.status === 'approved').length}{t.cases}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <div className="stat-label">{t.contribution}</div>
            <div className="stat-number">{currentUser?.contribution ?? 0}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <div className="stat-label">{t.overallRanking}</div>
            <div className="stat-number">
              {users.findIndex((u) => u.id === currentUser?.id) + 1 || '-'}{t.rank}
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: 30 }}>🔥 {t.popularProjects}</h3>
        <div className="project-grid">
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <span className="project-type">{t[project.category]}</span>
                <button className="favorite-btn" onClick={() => toggleFavorite(project.id)}>
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

        <h3 style={{ marginTop: 30 }}>📈 {t.trendingPosts} ( {t.freeBoard} )</h3>
        <div className="post-list">
          {trendingFree.map((post) => (
            <div
              key={post.id}
              className="post-item"
              onClick={() => router.push(`/free/${post.id}`)}
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
  };

  const ProjectsSection = () => {
    const sortedProjects = useMemo(() => {
      const base = projectTab === 'all' ? projects : projects.filter((p) => p.category === projectTab);
      return sortProjects(base);
    }, [projects, projectTab, projectSort, selectedRegion]);

    const favoriteProjects = sortedProjects.filter((p) => p.isFavorite);
    const displayProjects = [...favoriteProjects, ...sortedProjects.filter(p => !p.isFavorite)];

    return (
      <>
        <div className="content-header">
          <h2>📋 {t.allProjects}</h2>
        </div>

        <div className="filter-section">
          <div className="tabs">
            {(['all', 'restaurant', 'hotel', 'tourist', 'others'] as const).map((tab) => (
              <div key={tab} className={`tab ${projectTab === tab ? 'active' : ''}`} onClick={() => setProjectTab(tab)}>
                {tab === 'all' ? t.all : t[tab]}
              </div>
            ))}
          </div>

          <div className="filter-controls">
            <select
              value={projectSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectSort(e.target.value as ProjectSort)}
              className="filter-select"
            >
              <option value="points">{t.sortByPoints}</option>
              <option value="deadline">{t.sortByDeadline}</option>
              <option value="region">{t.filterByRegion}</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRegion(e.target.value)}
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
                <span className="project-type">{t[project.category]}</span>
                <button className="favorite-btn" onClick={() => toggleFavorite(project.id)}>
                  {project.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-location">📍 {project.location}</p>
              <p className="project-deadline">⏰ {project.deadline}</p>
              <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>{project.desc}</p>
              <div className="project-points">💰 {project.points.toLocaleString()}{t.yen}</div>
              <button className="apply-btn" onClick={() => openReservation(project)}>
                {t.apply}
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };

  const BoardSection = ({ board }: { board: 'free' | 'life' }) => {
    const posts = board === 'free' ? freePosts : lifePosts;
    const sortedPosts = useMemo(() => sortPosts(posts), [posts, boardSort, boardSearch]);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
    const title = board === 'free' ? t.freeBoard : t.lifeBoard;

    return (
      <>
        <div className="content-header">
          <h2>{board === 'free' ? '💬 ' + title : '💡 ' + title}</h2>
        </div>

        <div className="board-controls">
          <button
            className="apply-btn"
            style={{ width: 'auto' }}
            onClick={() => openWrite(board)}
          >
            ✏️ {t.writePost}
          </button>

          <div className="search-sort">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={boardSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBoardSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={boardSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBoardSort(e.target.value as SortType)}
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
              onClick={() => router.push(`/${board}/${post.id}`)}
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
            <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="page-btn">
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
  };

  const RankingSection = () => {
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
  };

  const MyPageSection = () => {
    if (!isLoggedIn || !currentUser) {
      alert(t.loginRequired);
      setActiveMenu('login');
      return null;
    }
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

        <h3 style={{ marginTop: 30 }}>{t.myProjects}</h3>
        <div className="project-status-list">
          {myProjects.map((project) => (
            <div key={project.id} className="project-status-item">
              <div className="project-status-info">
                <div className="project-status-title">{project.projectName}</div>
                <div className="project-status-meta">
                  {project.date} | {project.points}{t.yen} |
                  <span className={`status-badge status-${project.status}`} style={{ marginLeft: 8 }}>
                    {t[project.status]}
                  </span>
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

        {currentUser.points >= 20000 && <button className="submit-btn" style={{ marginTop: 20 }}>{t.requestRefund}</button>}
      </>
    );
  };

  const AdminSection = () => {
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
          {(['members', 'projects', 'statistics', 'export'] as const).map((tab) => (
            <div key={tab} className={`tab ${adminTab === tab ? 'active' : ''}`} onClick={() => setAdminTab(tab)}>
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.nickname}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.platform.join(', ')}</td>
                  <td>{u.region}</td>
                  <td>{u.points.toLocaleString()}</td>
                  <td>{u.registrationDate}</td>
                  <td>
                    <button
                      className="admin-btn"
                      onClick={() => {
                        const amountStr = prompt('차감할 포인트를 입력하세요:');
                        if (!amountStr) return;
                        const amount = parseInt(amountStr, 10);
                        if (Number.isNaN(amount) || amount < 0) {
                          alert('올바른 숫자를 입력하세요.');
                          return;
                        }
                        deductPoints(u.id, amount);
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
            <h3>제출된 결과물 관리</h3>
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
                {myProjects
                  .filter((p) => p.status === 'submitted')
                  .map((project) => (
                    <tr key={project.id}>
                      <td>{project.projectName}</td>
                      <td>{currentUser?.nickname}</td>
                      <td>{project.resultUrl}</td>
                      <td>{t[project.status]}</td>
                      <td>{project.points}</td>
                      <td>
                        <button className="admin-btn approve" onClick={() => approveResult(project.id, currentUser?.id || '')}>
                          {t.approveResult}
                        </button>
                        <button
                          className="admin-btn reject"
                          onClick={() => {
                            setMyProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: 'rejected' as const } : p)));
                          }}
                        >
                          {t.rejectResult}
                        </button>
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
  };

  // 메인 렌더
  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Segoe UI", Roboto, Arial, sans-serif;
          background: #f4f5f7; min-height: 100vh; color: #111;
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
        }
        header { background: #03c75a; color: white; padding: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: bold; cursor: pointer; }
        .user-info { display: flex; align-items: center; gap: 15px; }
        .lang-selector { position: relative; }
        .lang-btn { padding: 6px 12px; background: rgba(255,255,255,.2); border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: 600; }
        .lang-dropdown { position: absolute; top: 100%; right: 0; margin-top: 5px; background: white; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,.12); z-index: 1000; min-width: 160px; overflow: hidden; border: 1px solid #eaeaea; }
        .lang-option { padding: 10px 16px; cursor: pointer; color: #333; border-bottom: 1px solid #f5f5f5; font-weight: 600; }
        .lang-option:last-child { border-bottom: none; }
        .lang-option:hover { background: #f7f7f7; }
        .points-badge { background: rgba(255,255,255,.2); padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 700; }
        .main-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; display: flex; gap: 20px; }
        .sidebar { width: 200px; background: white; border-radius: 8px; padding: 20px; height: fit-content; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
        .menu-category { font-size: 12px; color: #666; margin: 15px 0 5px 5px; font-weight: bold; letter-spacing: .02em; }
        .menu-item { padding: 12px 15px; margin: 5px 0; border-radius: 6px; cursor: pointer; transition: all .2s; font-size: 14px; font-weight: 700; color: #222; }
        .menu-item:hover { background: #f0f0f0; }
        .menu-item.active { background: #03c75a; color: white; }
        .content { flex: 1; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
        .content-header { border-bottom: 2px solid #03c75a; padding-bottom: 15px; margin-bottom: 20px; }
        .content-header h2 { color: #111; letter-spacing: -.02em; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: 800; margin: 10px 0; text-shadow: 0 1px 0 rgba(0,0,0,.06); }
        .stat-label { font-size: 14px; opacity: .95; font-weight: 700; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .project-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; transition: all .2s; position: relative; }
        .project-card.favorite { border-color: #ffd700; background: #fffef5; }
        .project-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.07); transform: translateY(-2px); }
        .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .project-type { display: inline-block; padding: 4px 8px; background: #e7f5ff; color: #0c8599; border-radius: 4px; font-size: 12px; font-weight: 800; }
        .favorite-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
        .project-title { font-size: 18px; margin-bottom: 10px; color: #111; font-weight: 800; }
        .project-location, .project-deadline { color: #444; font-size: 14px; margin-bottom: 5px; }
        .project-points { color: #03c75a; font-weight: 900; margin-top: 10px; }
        .apply-btn { width: 100%; padding: 10px; background: #03c75a; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px; font-size: 14px; transition: background .2s; font-weight: 800; }
        .apply-btn:hover { background: #02b351; }
        .filter-section { margin-bottom: 20px; }
        .filter-controls { display: flex; gap: 10px; margin-top: 10px; }
        .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-weight: 700; color: #222; }
        .board-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .search-sort { display: flex; gap: 10px; }
        .search-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; width: 200px; font-weight: 700; color: #111; }
        .post-list { margin-top: 20px; }
        .post-item { padding: 15px; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: background .2s; }
        .post-item:hover { background: #f8f9fa; }
        .post-title { font-size: 16px; color: #111; margin-bottom: 5px; font-weight: 800; }
        .post-meta { font-size: 13px; color: #666; font-weight: 700; }
        .post-badge { display: inline-block; padding: 2px 6px; background: #ff6b6b; color: white; border-radius: 3px; font-size: 11px; margin-left: 5px; font-weight: 800; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }
        .page-btn { padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; color: #111; }
        .page-btn:disabled { opacity: .5; cursor: not-allowed; }
        .page-info { color: #444; font-weight: 800; }
        .ranking-table, .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .ranking-table th, .admin-table th { background: #f8f9fa; padding: 12px; text-align: left; font-size: 14px; color: #444; border-bottom: 2px solid #e0e0e0; font-weight: 900; }
        .ranking-table td, .admin-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; color: #111; font-weight: 700; }
        .rank-medal { display: inline-block; width: 25px; height: 25px; border-radius: 50%; text-align: center; line-height: 25px; font-weight: 900; color: white; font-size: 12px; }
        .rank-1 { background: gold; color: #333; } .rank-2 { background: silver; color: #333; } .rank-3 { background: #cd7f32; }
        .project-status-list { margin-top: 20px; }
        .project-status-item { padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .project-status-title { font-size: 16px; font-weight: 900; margin-bottom: 5px; color: #111; }
        .project-status-meta { font-size: 13px; color: #444; font-weight: 700; }
        .status-badge { padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px; font-weight: 900; }
        .status-pending { background: #ffd700; color: #333; }
        .status-submitted { background: #4169e1; color: white; }
        .status-approved { background: #32cd32; color: white; }
        .status-rejected { background: #dc143c; color: white; }
        .project-url { font-size: 12px; color: #0066cc; margin-top: 5px; font-weight: 800; }
        .submit-url-btn { padding: 8px 16px; background: #03c75a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 900; }
        .auth-container { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: #111; font-size: 14px; font-weight: 800; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-weight: 700; color: #111; }
        .input-with-button { display: flex; gap: 10px; }
        .input-with-button input { flex: 1; }
        .check-btn { padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; font-weight: 900; }
        .check-message { margin-top: 5px; font-size: 12px; }
        .check-message.success { color: #2f9e44; font-weight: 900; }
        .check-message.error { color: #c92a2a; font-weight: 900; }
        .checkbox-list { display: flex; flex-direction: column; gap: 10px; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 800; color: #111; }
        .checkbox-item input { width: auto; }
        .submit-btn { width: 100%; padding: 12px; background: #03c75a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background .2s; font-weight: 900; }
        .submit-btn:hover { background: #02b351; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
        .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s; font-weight: 900; }
        .tab:hover { background: #f8f9fa; }
        .tab.active { border-bottom-color: #03c75a; color: #03c75a; }
        .admin-btn { padding: 5px 10px; margin: 0 2px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; background: #666; color: white; font-weight: 900; }
        .admin-btn.approve { background: #32cd32; } .admin-btn.reject { background: #dc143c; }
        .export-section { padding: 20px; }
        .export-section h3 { margin-bottom: 10px; color: #111; font-weight: 900; }
        .export-section p { color: #444; margin-bottom: 20px; font-weight: 700; }
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .modal-close { float: right; font-size: 24px; cursor: pointer; color: #999; }
        .modal-close:hover { color: #333; }
        .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin: 20px 0; }
        .calendar-day { padding: 10px; text-align: center; border: 1px solid #e0e0e0; cursor: pointer; transition: all .2s; font-weight: 800; color: #111; }
        .calendar-day:hover { background: #f0f0f0; }
        .calendar-day.selected { background: #03c75a; color: white; }
        .image-upload-area { border: 2px dashed #ddd; border-radius: 6px; padding: 20px; text-align: center; cursor: pointer; margin-top: 10px; font-weight: 800; color: #111; }
        .image-upload-area:hover { background: #f8f9fa; }
        .image-preview { max-width: 100%; margin-top: 10px; border-radius: 6px; }
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
            <div className="lang-selector">
              <button className="lang-btn" onClick={() => setShowLangDropdown(!showLangDropdown)}>
                🌐 {language.toUpperCase()} ▼
              </button>
              {showLangDropdown && (
                <div className="lang-dropdown">
                  {([
                    { code: 'ko', label: '🇰🇷 한국어' },
                    { code: 'ja', label: '🇯🇵 日本語' },
                    { code: 'en', label: '🇺🇸 English' },
                    { code: 'zh', label: '🇨🇳 中文' },
                  ] as { code: Lang; label: string }[]).map((opt) => (
                    <div key={opt.code}
                      className="lang-option"
                      onClick={() => { setLanguage(opt.code); setShowLangDropdown(false); }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isLoggedIn && currentUser && (
              <div className="points-badge">
                💰 {t.points}: {currentUser.points.toLocaleString()}{t.yen}
              </div>
            )}

            <span>{isLoggedIn && currentUser ? `${currentUser.nickname}님` : t.loginPrompt}</span>

            <button
              onClick={isLoggedIn ? handleLogout : () => setActiveMenu('login')}
              style={{ padding: '8px 16px', background: 'white', color: '#03c75a', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 900 }}
            >
              {isLoggedIn ? t.logout : t.login}
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <div className="menu-category">{t.mainMenu}</div>
          <div className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`} onClick={() => setActiveMenu('home')}>
            🏠 {t.home}
          </div>
          <div className={`menu-item ${activeMenu === 'projects' ? 'active' : ''}`} onClick={() => setActiveMenu('projects')}>
            📋 {t.projectList}
          </div>
          <div className={`menu-item ${activeMenu === 'mypage' ? 'active' : ''}`} onClick={() => setActiveMenu('mypage')}>
            👤 {t.myPage}
          </div>

          <div className="menu-category">{t.community}</div>
          <div className={`menu-item ${activeMenu === 'board' ? 'active' : ''}`} onClick={() => setActiveMenu('board')}>
            💬 {t.freeBoard}
          </div>
          <div className={`menu-item ${activeMenu === 'life' ? 'active' : ''}`} onClick={() => setActiveMenu('life')}>
            💡 {t.lifeBoard}
          </div>
          <div className={`menu-item ${activeMenu === 'ranking' ? 'active' : ''}`} onClick={() => setActiveMenu('ranking')}>
            🏆 {t.ranking}
          </div>

          <div className="menu-category">{t.management}</div>
          <div className={`menu-item ${activeMenu === 'admin' ? 'active' : ''}`} onClick={() => setActiveMenu('admin')}>
            ⚙️ {t.admin}
          </div>
        </aside>

        <main className="content">
          {activeMenu === 'home' && <HomeSection />}
          {activeMenu === 'projects' && <ProjectsSection />}
          {activeMenu === 'board' && <BoardSection board="free" />}
          {activeMenu === 'life' && <BoardSection board="life" />}
          {activeMenu === 'ranking' && <RankingSection />}
          {activeMenu === 'mypage' && <MyPageSection />}
          {activeMenu === 'admin' && <AdminSection />}

          {activeMenu === 'login' && (
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
                      <button type="button" className="check-btn"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | null);
                          if (input) checkNickname(input.value);
                        }}>{t.checkDuplicate}</button>
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
                      <label className="checkbox-item"><input type="checkbox" name="platform" value="네이버 블로그" /> <span>{t.naverBlog}</span></label>
                      <label className="checkbox-item"><input type="checkbox" name="platform" value="유튜브" /> <span>{t.youtube}</span></label>
                      <label className="checkbox-item"><input type="checkbox" name="platform" value="인스타그램" /> <span>{t.instagram}</span></label>
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
                    <label className="checkbox-item"><input type="checkbox" required /> <span>{t.privacyAgree}</span></label>
                    <label className="checkbox-item"><input type="checkbox" required /> <span>{t.termsAgree}</span></label>
                  </div>

                  <button type="submit" className="submit-btn">{t.signup}</button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 신청 모달 (년/월 레이블 간단 추가) */}
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
              <label>희망 날짜 선택 (2024.12)</label>
              <div className="calendar">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div key={day}
                    className={`calendar-day ${selectedDate === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >{day}</div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>희망 시간</label>
              <select>
                {['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <button className="submit-btn" onClick={confirmReservation}>
              신청 확정
            </button>
          </div>
        </div>
      )}

      {/* 글쓰기 모달 + next/image 사용(프리뷰도 OK) */}
      {showWriteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setShowWriteModal(false)}>&times;</span>
            <h2>{writeBoard === 'free' ? t.freeBoard : t.lifeBoard} - {t.writePost}</h2>

            <div className="form-group">
              <label>{t.titleLabel}</label>
              <input type="text" value={writeTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWriteTitle(e.target.value)} placeholder={t.titleLabel}/>
            </div>

            <div className="form-group">
              <label>{t.contentLabel}</label>
              <textarea
                value={writeContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWriteContent(e.target.value)}
                placeholder={t.contentLabel}
                rows={6}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5 }}
              />
            </div>

            <div className="form-group">
              <label>{t.imageUpload}</label>
              <div className="image-upload-area">
                <input type="file" accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setWriteImage(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}/>
                {writeImage && (
                  <div style={{ marginTop: 10 }}>
                    <Image src={writeImage} alt="preview" width={800} height={450} className="image-preview"/>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="submit-btn" onClick={submitWrite} style={{ width: 'auto', padding: '10px 20px' }}>
                {t.postSubmit}
              </button>
              <button className="tab" style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 900 }}
                onClick={() => setShowWriteModal(false)}>{t.cancel}</button>
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
              <label>프로젝트명</label>
              <input type="text" value={selectedMyProject.projectName} readOnly />
            </div>

            <div className="form-group">
              <label>{t.resultUrl}</label>
              <input type="url" value={submitUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmitUrl(e.target.value)} placeholder="https://example.com/my-review"/>
            </div>

            <button className="submit-btn" onClick={handleUrlSubmit}>{t.submitUrl}</button>
          </div>
        </div>
      )}
    </>
  );
}
