import React, { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../../utils/api';
import { Plus, CheckCircle2, Circle, Clock, Trash2, Flag, Tag, Calendar, BarChart3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const priorityConfig = {
  high: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', badge: 'badge-red', label: 'High' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10', badge: 'badge-yellow', label: 'Medium' },
  low: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10', badge: 'badge-green', label: 'Low' },
};

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const emptyForm = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', tags: '' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const [tasksRes, statsRes] = await Promise.all([tasksAPI.getAll(params), tasksAPI.getStats()]);
      setTasks(tasksRes.tasks || []);
      setStats(statsRes.stats || []);
    } catch (e) { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '', tags: task.tags?.join(', ') || '' });
    setEditId(task._id);
    setModalOpen(true);
  };

  const saveTask = async () => {
    if (!form.title.trim()) return toast.error('Task title required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editId) {
        const data = await tasksAPI.update(editId, payload);
        setTasks(prev => prev.map(t => t._id === editId ? data.task : t));
        toast.success('Task updated!');
      } else {
        const data = await tasksAPI.create(payload);
        setTasks(prev => [data.task, ...prev]);
        toast.success('Task created!');
      }
      setModalOpen(false);
      fetchTasks(); // refresh stats
    } catch (e) { toast.error('Failed to save task'); }
    finally { setSaving(false); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      const data = await tasksAPI.update(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? data.task : t));
      if (newStatus === 'completed') toast.success('Task completed! 🎉');
    } catch (e) { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
      fetchTasks();
    } catch (e) { toast.error('Failed to delete task'); }
  };

  const getStatCount = (status) => stats.find(s => s._id === status)?.count || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Task Manager</h1>
          <p className="page-subtitle">Organize your work and track productivity</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.reduce((a, s) => a + s.count, 0), icon: BarChart3, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'To Do', value: getStatCount('todo'), icon: Circle, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' },
          { label: 'In Progress', value: getStatCount('in-progress'), icon: Clock, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Completed', value: getStatCount('completed'), icon: CheckCircle2, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.split(' ').slice(1).join(' ')}`}>
              <Icon size={18} className={color.split(' ')[0]} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filter === value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
            )}
          >
            {label}
            {value !== 'all' && <span className="ml-1.5 text-xs opacity-70">({getStatCount(value)})</span>}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <div className="card empty-state">
          <CheckCircle2 size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first task to get started</p>
          <button onClick={openCreate} className="btn-primary btn-sm mt-4">
            <Plus size={14} className="mr-1" /> Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={clsx(
                'card p-4 flex items-start gap-3 group transition-all',
                task.status === 'completed' && 'opacity-70'
              )}
            >
              {/* Checkbox */}
              <button onClick={() => toggleComplete(task)} className="mt-0.5 flex-shrink-0">
                {task.status === 'completed'
                  ? <CheckCircle2 size={20} className="text-green-500 fill-green-500" />
                  : <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={clsx('text-sm font-medium text-gray-900 dark:text-white', task.status === 'completed' && 'line-through text-gray-400')}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(task)} className="btn-icon text-gray-400 hover:text-blue-500 w-7 h-7 text-xs">✏️</button>
                    <button onClick={() => deleteTask(task._id)} className="btn-icon text-gray-400 hover:text-red-500 w-7 h-7">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={clsx('badge', priorityConfig[task.priority]?.badge)}>
                    <Flag size={10} className="mr-1" />
                    {priorityConfig[task.priority]?.label}
                  </span>
                  {task.status === 'in-progress' && <span className="badge-yellow">In Progress</span>}
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={11} />
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {task.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                      <Tag size={9} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Task' : 'New Task'} size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={saveTask} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="input" autoFocus />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Optional details..." className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input capitalize">
                {['low', 'medium', 'high'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input" />
          </div>
          <div>
            <label className="input-label">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, assignment, urgent" className="input" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
