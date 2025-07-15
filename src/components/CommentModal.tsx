import React, { useState, useRef, useEffect } from 'react';
import { useComments } from '../hooks/useComments';

interface CommentModalProps {
  marketId: string;
  userAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ marketId, userAddress, isOpen, onClose }) => {
  const { comments, loading, addComment } = useComments(marketId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const commentListRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  useEffect(() => {
    if (!loading && commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [loading, comments.length]);

  const getDiceBearUrl = (address: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addComment(userAddress, text.trim());
      setText('');
    } catch (err) {
      setError('Failed to add comment.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-mint-700 mb-4 text-center">Comments</h2>
        <div ref={commentListRef} className="overflow-y-auto mb-4 flex flex-col gap-3 px-1" style={{ maxHeight: '18rem' }}>
          {loading ? (
            <div className="text-center text-gray-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((c) => (
              <div key={c.id || c.user + '-' + c.createdAt} className="flex items-start gap-3">
                <img src={getDiceBearUrl(c.user)} alt="avatar" className="w-10 h-10 rounded-full border-2 border-orange-200 bg-white mt-1" />
                <div className="flex flex-col bg-white rounded-xl shadow p-3 min-w-[180px] max-w-[90%] border border-orange-100">
                  <span className="text-xs font-bold text-orange-600 mb-1">{c.user.slice(0, 6) + '...' + c.user.slice(-4)}</span>
                  <span className="text-gray-800 text-base break-words">{c.text}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="w-full border border-mint-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-mint-500"
            rows={3}
            placeholder="Type your comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={submitting}
          />
          {error && <div className="text-orange-500 text-xs font-bold">{error}</div>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg shadow transition cursor-pointer text-base disabled:opacity-60"
            disabled={submitting || !text.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentModal; 