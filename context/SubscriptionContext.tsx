import { ALL_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS } from '@/constants/data';
import React, { createContext, useContext, useState } from 'react';

export interface SubscriptionContextType {
  subscriptions: Subscription[];
  homeSubscriptions: Subscription[];
  addSubscription: (newSubscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allSubscriptions, setAllSubscriptions] =
    useState<Subscription[]>(ALL_SUBSCRIPTIONS);
  const [homeSubscriptions, setHomeSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (newSubscription: Subscription) => {
    setAllSubscriptions((prev) => [newSubscription, ...prev]);
    setHomeSubscriptions((prev) => [newSubscription, ...prev]);
  };

  const deleteSubscription = (id: string) => {
    setAllSubscriptions((prev) => prev.filter((s) => s.id !== id));
    setHomeSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions: allSubscriptions,
        homeSubscriptions,
        addSubscription,
        deleteSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};
