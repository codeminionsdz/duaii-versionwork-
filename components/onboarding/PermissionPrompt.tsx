import React, { useState } from 'react';
import {
  requestPushPermission,
  requestGeolocationPermission,
  openAppSettings,
  PermissionState,
} from '../../src/lib/permissions';

type Props = {
  permission: 'push' | 'location';
  title?: string;
  description?: string;
  onComplete?: (state: PermissionState) => void;
};

export const PermissionPrompt: React.FC<Props> = ({ permission, title, description, onComplete }) => {
  const [status, setStatus] = useState<PermissionState | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRequest = async () => {
    setBusy(true);
    try {
      const res = permission === 'push' ? await requestPushPermission() : await requestGeolocationPermission();
      setStatus(res.state);
      onComplete?.(res.state);
    } catch (e) {
      setStatus('error');
      onComplete?.('error');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenSettings = async () => {
    await openAppSettings();
  };

  const defaultTitle = permission === 'push' ? 'الإشعارات' : 'الموقع'
  const defaultDescription =
    description ||
    (permission === 'push'
      ? 'نستخدم الإشعارات لإرسال التحديثات المهمة. اضغط السماح لتمكينها.'
      : 'نحتاج الوصول للموقع لعرض النتائج القريبة وحساب المسافات. اضغط السماح لتمكينه.')

  return (
    <div className="w-full bg-transparent">
      <h3 className="text-lg font-medium mb-2">{title ?? defaultTitle}</h3>
      <p className="text-sm text-slate-500 mb-4">{defaultDescription}</p>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleRequest}
          disabled={busy}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50"
        >
          {busy ? 'جارٍ الطلب…' : 'السماح'}
        </button>

        {status && (
          <div className="text-sm text-slate-600">
            {status === 'granted' && 'تم منح الإذن'}
            {status === 'denied' && (
              <>
                تم رفض الإذن — يمكنك تمكينه من الإعدادات.
                <div className="mt-2">
                  <button onClick={handleOpenSettings} className="w-full py-2 rounded-md border border-slate-200">
                    فتح الإعدادات
                  </button>
                </div>
              </>
            )}
            {status === 'prompt' && 'حالة الطلب: لم يقرر المستخدم بعد'}
            {status === 'unavailable' && 'غير متاح على هذا الجهاز'}
            {status === 'error' && 'حدث خطأ أثناء التحقق/طلب الإذن'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionPrompt;
