import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { rewardService } from '@/services/rewardService';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';

export const GlobalCitizenRedemptionListener = () => {
  const { userProfile, user } = useAuth();
  const { playChime } = useClientSettings();
  const [activeHandshake, setActiveHandshake] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const role = userProfile?.role?.toLowerCase();
  const isCitizen = !role || role === 'citizen' || role === 'user';
  // Use Firebase Auth user.uid directly for instant subscription without waiting for Firestore profile fetch
  const uid = user?.uid || userProfile?.uid;

  useEffect(() => {
    if (!isCitizen || !uid) return;

    const unsubscribe = rewardService.listenToCitizenRedemptions(uid, (redemptions) => {
      // Find the first voucher waiting for 2-party handshake confirmation
      const awaitingItem = redemptions.find(
        (r) => r.status === 'awaiting_confirmation'
      );

      if (awaitingItem) {
        setActiveHandshake((prev) => {
          const currentId = awaitingItem.redemptionId || awaitingItem.id;
          const prevId = prev?.redemptionId || prev?.id;
          if (!prev || prevId !== currentId || prev.status !== awaitingItem.status) {
            playChime();
          }
          return awaitingItem;
        });
        setModalOpen(true);
      } else {
        setActiveHandshake((prev) => {
          if (!prev) return null;
          const currentId = prev.redemptionId || prev.id;
          const updated = redemptions.find((r) => (r.redemptionId || r.id) === currentId);
          if (updated && updated.status === 'completed') {
            return updated;
          }
          setModalOpen(false);
          return null;
        });
      }
    });

    return () => unsubscribe();
  }, [isCitizen, uid]);

  if (!isCitizen) return null;

  return (
    <RedemptionTicketModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      redemption={activeHandshake}
    />
  );
};
