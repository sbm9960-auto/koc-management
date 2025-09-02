'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import type { CommentItem, Lang, Post, User } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { getLS, setLS, LS } from '@/lib/storage';

export default function LifePostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const [language, setLanguage] = useState<Lang>('ko');
  const t = translations[language];

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);

  useEffect(() => {
    setLanguage(getLS<Lang>(LS.lang, 'ko'));
    setIsLoggedIn(getLS<boolean>(LS.isLoggedIn, false));
    setCurrentUser(getLS<User | null>(LS.currentUser, null));
    setPosts(getLS<Post[]>(LS.postsLife, []));
    setComments(getLS<CommentItem[]>(LS.comments, []));
  }, []);

  const post = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);

  useEffect(() => {
    if (!post) return;
    const updated = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p);
    setPosts(updated);
    setLS(LS.postsLife, updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const postComments = useMemo(
    () => comments.filter(c => c.postId === postId && c.board === 'life'),
    [comments, postId]
  );
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (!isLoggedIn || !currentUser) {
      alert(t.loginRequired);
      return;
    }
    if (!post) return;

    const item: CommentItem = {
      id: (comments.length ? Math.max(...comments.map(c => c.id)) : 0) + 1,
      postId: post.id,
      board: 'life',
      authorId: currentUser.id,
      authorNickname: currentUser.nickname,
      content: newComment.trim(),
      date: new Date().toISOString(),
    };
    const next = [...comments, item];
    setComments(next);
    setLS(LS.comments, next);

    const updatedPosts = posts.map(p => p.id === post.id ? { ...p, comments: p.comments + 1 } : p);
    setPosts(updatedPosts);
    setLS(LS.postsLife, updatedPosts);

    setNewComment('');
  };

  const removeComment = (id: number) => {
    const target = comments.find(c => c.id === id);
    if (!target) return;
    if (currentUser?.id !== 'admin' && currentUser?.id !== target.authorId) {
      alert('삭제 권한이 없습니다.');
      return;
    }
    const next = comments.filter(c => c.id !== id);
    setComments(next);
    setLS(LS.comments, next);

    if (post) {
      const updated = posts.map(p => p.id === post.id ? { ...p, comments: Math.max(0, p.comments - 1) } : p);
      setPosts(updated);
      setLS(LS.postsLife, updated);
    }
  };

  if (!post) {
    return (
      <div style={{ padding: 24 }}>
        <p>게시글을 찾을 수 없습니다.</p>
        <button onClick={() => router.push('/?menu=life')} style={{ marginTop: 12 }}>← 목록으로</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <button onClick={() => router.push('/?menu=life')} style={{ marginBottom: 12 }}>← {t.lifeBoard}</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{post.title}</h1>
      <div style={{ color: '#666', marginBottom: 16, fontWeight: 600 }}>
        {post.authorNickname} | {post.date} | {t.views} {post.views} | {t.comments} {post.comments}
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</div>
      {post.image && (
        <div style={{ marginTop: 16 }}>
          <Image src={post.image} alt="post image" width={1000} height={560} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
        </div>
      )}

      <hr style={{ margin: '24px 0' }} />

      <h3 style={{ fontWeight: 800, marginBottom: 8 }}>{t.comments}</h3>
      {postComments.length === 0 && <div style={{ color: '#666', marginBottom: 12 }}>{t.noComments}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {postComments.map((c) => (
          <div key={c.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 800 }}>{c.authorNickname}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{new Date(c.date).toLocaleString()}</div>
            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{c.content}</div>
            {(currentUser?.id === 'admin' || currentUser?.id === c.authorId) && (
              <button style={{ marginTop: 8 }} onClick={() => removeComment(c.id)}>삭제</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <textarea
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
          placeholder={t.addComment}
          rows={3}
          style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button onClick={addComment} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 6, background: '#03c75a', color: '#fff', border: 'none', fontWeight: 800 }}>
          {t.addComment}
        </button>
      </div>
    </div>
  );
}
