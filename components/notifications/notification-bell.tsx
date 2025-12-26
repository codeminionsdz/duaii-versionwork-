'use client';

import { useState, useEffect } from 'react';
import { getUnreadCount } from '@/app/actions/notifications';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NotificationCenter } from './notification-center';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCount();

    // Optional: Refresh every 30 seconds
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="الإشعارات"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && !isLoading && (
            <Badge
              className="absolute top-0 right-0 w-5 h-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[600px] p-0 overflow-hidden">
        <SheetHeader className="hidden">
          <SheetTitle>الإشعارات</SheetTitle>
          <SheetDescription>مركز الإشعارات</SheetDescription>
        </SheetHeader>
        <NotificationCenter />
      </SheetContent>
    </Sheet>
  );
}
