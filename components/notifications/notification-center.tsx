'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: Record<string, any> | null;
  created_at: string;
}

const notificationTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  info: { label: 'معلومة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900', icon: 'ℹ️' },
  success: { label: 'نجح', color: 'bg-green-100 text-green-800 dark:bg-green-900', icon: '✓' },
  warning: { label: 'تحذير', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900', icon: '⚠️' },
  error: { label: 'خطأ', color: 'bg-red-100 text-red-800 dark:bg-red-900', icon: '✕' },
  medicine: { label: 'دواء', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900', icon: '💊' },
  pharmacy: { label: 'صيدلية', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900', icon: '🏥' },
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.info;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    locale: arSA,
    addSuffix: true,
  });

  return (
    <Card
      className={`p-4 transition-colors ${
        !notification.read ? 'bg-muted/50 border-primary/50' : ''
      } hover:bg-muted/80`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`text-xl ${config.color} rounded p-2 h-fit`}>{config.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{notification.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {notification.message}
              </p>
            </div>
            <Badge variant="outline" className={config.color}>
              {config.label}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <div className="flex gap-1">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRead(notification.id)}
                  className="h-8 w-8 p-0"
                  title="تحديد كمقروء"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/notifications/list?limit=50`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to fetch notifications')
      }
      const body = await res.json()
      setNotifications(body.notifications || [])
      setUnreadCount(body.unread || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('فشل في تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Set up real-time subscription (optional)
    // const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    // return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
      setError('فشل في تحديث الإشعار');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError('فشل في تحديث الإشعارات');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        const deleted = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (deleted && !deleted.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('فشل في حذف الإشعار');
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'إشعار اختباري',
          message: 'هذا إشعار اختباري للتحقق من عمل النظام',
        }),
      })

      if (response.ok) {
        console.log('✅ Test notification created successfully')
        await loadNotifications()
      } else {
        const error = await response.json()
        console.error('❌ Failed to create test notification:', error)
        setError(`فشل في إنشاء إشعار اختباري: ${error.error}`)
      }
    } catch (err) {
      console.error('❌ Error creating test notification:', err)
      setError('خطأ في الاتصال بخادم الإشعارات')
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <Badge className="ml-2">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              title="تحديد الكل كمقروء"
            >
              <CheckCheck className="w-4 h-4 ml-2" />
              تحديد الكل
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التحميل...' : 'تحديث'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestNotification}
            className="text-xs"
          >
            🧪 اختبار
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 mb-4 bg-destructive/10 text-destructive border-destructive">
          {error}
        </Card>
      )}

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">لا توجد إشعارات</p>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] border rounded-lg p-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
