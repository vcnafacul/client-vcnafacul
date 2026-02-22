import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserMe } from '@/types/user/userMe';
import { me } from '@/services/auth/me';
import { useAuthStore } from '@/store/auth';

export function useAccountData() {
  const { data: { token }, updateAccount } = useAuthStore();
  const [userAccount, setUserAccount] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const data = await me(token);
        setUserAccount(data);
        updateAccount(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadUserData();
    }
  }, [token, updateAccount]);

  const updateUserAccount = (updates: Partial<UserMe>) => {
    if (!userAccount) return;
    const updated = { ...userAccount, ...updates };
    setUserAccount(updated);
    updateAccount(updated);
  };

  return {
    userAccount,
    isLoading,
    updateUserAccount,
  };
}

