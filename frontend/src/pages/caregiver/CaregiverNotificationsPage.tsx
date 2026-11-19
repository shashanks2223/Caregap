import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Shield, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.log('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.log('Error marking read:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Notifications Center" subtitle="Real-time alerts regarding policy status and claims" />

        <main className="p-6 max-w-4xl space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              {notifications.filter(n => !n.is_read).length} unread notifications
            </span>
            <button
              onClick={markAllRead}
              className="text-xs text-teal-600 font-bold hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No notifications found.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 text-xs flex items-start gap-3 ${n.is_read ? 'bg-white' : 'bg-teal-50/40'}`}>
                  <div className={`p-2 rounded-xl mt-0.5 ${n.is_read ? 'bg-slate-100 text-slate-500' : 'bg-teal-500 text-white'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-navy-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

