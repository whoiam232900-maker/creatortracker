import { useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { getSubscriptionStatus } from '../lib/subscription';
import { showToast } from '../components/ui/Toast';
import { useSettings } from '../contexts/SettingsContext';

export function useSubscriptionAlerts() {
  const { plan } = useSubscription();
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.enableNotifications || !settings.notifySubscriptionWarnings) return;

    const raw = localStorage.getItem('userSession');
    if (!raw) return;

    try {
      const session = JSON.parse(raw);
      if (session.plan === 'Free') return;

      const status = getSubscriptionStatus(session);
      
      // Only show alert once per session to avoid spam
      const lastAlertKey = `last_sub_alert_${session.id}`;
      const lastAlert = sessionStorage.getItem(lastAlertKey);
      if (lastAlert) return;

      if (status.isExpired) {
        showToast({
          type: 'error',
          title: 'Subscription Expired',
          description: 'Your premium access has expired. Features have been downgraded to Free.',
          category: 'subscription'
        });
        sessionStorage.setItem(lastAlertKey, 'expired');
      } else if (status.daysLeft !== null && status.daysLeft <= 7) {
        showToast({
          type: 'warning',
          title: 'Subscription Expiring Soon',
          description: `Your ${status.storedPlan} plan expires in ${status.daysLeft} days.`,
          category: 'subscription'
        });
        sessionStorage.setItem(lastAlertKey, 'warning');
      }
    } catch (e) {
      console.error('[useSubscriptionAlerts] Error:', e);
    }
  }, [settings.enableNotifications, settings.notifySubscriptionWarnings, plan]);
}
