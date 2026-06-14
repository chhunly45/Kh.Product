import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../services/notification.api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data || []);
      } catch (error) {
        setMessage('Unable to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, read: true } : item)));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      setMessage('Unable to mark notification as read.');
    }
  };

  return (
    <div className="space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
            <p className="mt-2 text-sm text-slate-500">Review updates about favorites, sales, verification status, and moderation.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            <Bell className="w-5 h-5 text-slate-500" />
            {notifications.filter((notification) => !notification.read).length} unread
          </div>
        </div>
      </header>

      {message && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{message}</div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-600">Loading notifications…</div>
      ) : notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article key={notification._id} className={`rounded-3xl border ${notification.read ? 'border-slate-200 bg-white' : 'border-sky-300 bg-sky-50'} p-6 shadow-sm`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{notification.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                  {notification.link && (
                    <Link to={notification.link} className="mt-3 inline-flex text-sm font-semibold text-sky-600 hover:text-sky-700">
                      View details
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => markRead(notification._id)}
                  disabled={notification.read}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {notification.read ? 'Read' : 'Mark as read'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
          <p className="text-lg font-semibold">No notifications yet</p>
          <p className="mt-2 text-sm">Once your listings are saved or reviewed, notifications will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
