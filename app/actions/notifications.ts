'use server'

import { createClient } from '@/lib/supabase/server';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: Record<string, any> | null;
  created_at: string;
}

export async function getNotifications(limit = 20) {
  const supabase = await createClient();

  // Ensure we operate as the authenticated user. We rely on the
  // server-side Supabase client (cookies-based) to obtain the current
  // user's session. This prevents accepting a userId from the client.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Caller must be authenticated. Do not return cross-user data.
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id) // enforce user isolation at query level
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return (data as Notification[]) || [];
}

export async function getUnreadCount() {
  const supabase = await createClient();

  // Get authenticated user and scope query to them only.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();

  // Only the authenticated user may mark their own notifications as read.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllAsRead() {
  const supabase = await createClient();

  // Mark all unread notifications for the authenticated user only.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();

  // Delete a single notification only if it belongs to the authenticated user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export async function deleteAllNotifications() {
  const supabase = await createClient();

  // Delete all notifications for the authenticated user only.
  // NOTE: This intentionally scopes deletion to the current user to avoid
  // mass-deletion across users. RLS policies should also enforce this,
  // but we add explicit scoping as defence-in-depth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}
