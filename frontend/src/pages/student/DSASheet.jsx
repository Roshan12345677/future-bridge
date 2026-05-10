import React, { useState, useEffect, useCallback } from 'react';
import { dsaAPI } from '../../utils/api';
import { CheckCircle2, Circle, Bookmark, ExternalLink, Filter, Search, ChevronDown, Trophy, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const TOPICS = ['all', 'array', 'string', 'linked-list', 'tree', 'graph', 'dynamic-programming', 'binary-search', 'sorting', 'recursion', 'stack', 'queue', 'heap', 'hash-map', 'two-pointers', 'sliding-window', 'backtracking', 'greedy'];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const COMPANIES = ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Apple', 'Uber', 'Adobe', 'LinkedIn', 'Goldman Sachs', 'Flipkart', 'Swiggy'];

const diffConfig = {
  easy: { class: 'diff-easy', label: 'Easy' },
  medium: { class: 'diff-medium', label: 'Medium' },
  hard: { class: 'diff-hard', label: 'Hard' },
};

const statusConfig = {
  solved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
  attempted: { icon: Circle, color: 'text-yellow-500', bg: '' },
  bookmarked: { icon: Bookmark, color: 'text-blue-500', bg: '' },
  unsolved: { icon: Circle, color: 'text-gray-300 dark:text-gray-600', bg: '' },
};

const DSASheet = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [filters, setFilters] = useState({ topic: 'all', difficulty: 'all', company: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.topic !== 'all') params.topic = filters.topic;
      if (filters.difficulty !== 'all') params.difficulty = filters.difficulty;
      if (filters.company) params.company = filters.company;
      if (filters.search) params.search = filters.search;

      const [probRes, statRes] = await Promise.all([
        dsaAPI.getAll(params),
        dsaAPI.getStats(),
      ]);
      setProblems(probRes.problems || []);
      setStats(statRes.stats || []);
    } catch (e) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const toggleStatus = async (problem) => {
    setUpdatingId(problem._id);
    const nextStatus = {
      unsolved: 'solved',
      attempted: 'solved',
      solved: 'unsolved',
      bookmarked: 'solved',
    };
    try {
      await dsaAPI.updateProgress({ problemId: problem._id, status: nextStatus[problem.userStatus] });
      setProblems((prev) =>
        prev.map((p) => p._id === problem._id ? { ...p, userStatus: nextStatus[p.userStatus] } : p)
      );
      if (nextStatus[problem.userStatus] === 'solved') toast.success('Problem marked as solved! 🎉');
    } catch (e) {
      toast.error('Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleBookmark = async (problem) => {
    const newStatus = problem.userStatus === 'bookmarked' ? 'unsolved' : 'bookmarked';
    try {
      await dsaAPI.updateProgress({ problemId: problem._id, status: newStatus });
      setProblems((prev) => prev.map((p) => p._id === problem._id ? { ...p, userStatus: newStatus } : p));
    } catch (e) {
      toast.error('Failed to update bookmark');
    }
  };

  const totalSolved = stats.reduce((a, s) => a + s.count, 0);
  const totalProblems = problems.length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">LeetNext - DSA Sheet</h1>
          <p className="page-subtitle">Master Data Structures & Algorithms with curated problems</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSolved}</p>
          <p className="text-xs text-gray-500">Solved</p>
        </div>
        {[{ label: 'Easy', color: 'text-green-500' }, { label: 'Medium', color: 'text-yellow-500' }, { label: 'Hard', color: 'text-red-500' }].map(({ label, color }) => {
          const count = stats.find((s) => s._id === label.toLowerCase())?.count || 0;
          return (
            <div key={label} className="card p-4 text-center">
              <Target size={20} className={`${color} mx-auto mb-1`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-gray-500">{totalSolved}/{totalProblems}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${totalProblems ? (totalSolved / totalProblems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search problems..."
              className="input pl-9"
            />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className="btn-outline flex items-center gap-2 whitespace-nowrap">
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={clsx('transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
            <div>
              <label className="input-label">Topic</label>
              <select value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })} className="input capitalize">
                {TOPICS.map((t) => <option key={t} value={t} className="capitalize">{t === 'all' ? 'All Topics' : t.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Difficulty</label>
              <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="input capitalize">
                {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d === 'all' ? 'All Levels' : d}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Company</label>
              <select value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} className="input">
                <option value="">All Companies</option>
                {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Problems Table */}
      {loading ? (
        <LoadingSpinner text="Loading problems..." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-8">Status</th>
                  <th className="px-4 py-3 text-left">Problem</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Topic</th>
                  <th className="px-4 py-3 text-left">Difficulty</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Companies</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {problems.map((problem) => {
                  const statusConf = statusConfig[problem.userStatus] || statusConfig.unsolved;
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr key={problem._id} className={clsx('hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors', statusConf.bg)}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(problem)}
                          disabled={updatingId === problem._id}
                          className={clsx('transition-all hover:scale-110', statusConf.color)}
                        >
                          <StatusIcon size={18} className={problem.userStatus === 'solved' ? 'fill-current' : ''} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{problem.title}</span>
                          {problem.timeComplexity && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                              <span>⏱ {problem.timeComplexity}</span>
                              <span>💾 {problem.spaceComplexity}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="badge-gray capitalize text-xs">{problem.topic?.replace('-', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge', diffConfig[problem.difficulty]?.class)}>
                          {diffConfig[problem.difficulty]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {problem.companies?.slice(0, 2).map((c) => (
                            <span key={c} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                          {problem.companies?.length > 2 && <span className="text-xs text-gray-400">+{problem.companies.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => toggleBookmark(problem)} className={clsx('btn-icon', problem.userStatus === 'bookmarked' ? 'text-blue-500' : 'text-gray-400')}>
                            <Bookmark size={15} className={problem.userStatus === 'bookmarked' ? 'fill-current' : ''} />
                          </button>
                          {problem.leetcodeUrl && (
                            <a href={problem.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="btn-icon text-gray-400 hover:text-orange-500">
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {problems.length === 0 && (
              <div className="empty-state">
                <Zap size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">No problems found. Try changing your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DSASheet;
