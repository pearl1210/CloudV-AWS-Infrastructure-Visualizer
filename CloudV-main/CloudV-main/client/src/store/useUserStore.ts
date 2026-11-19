import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LoginInputState, SignupInputState } from '@/schema/userSchema';
import { toast } from 'sonner';
import { api, getApiErrorMessage } from '@/lib/api';

type User = {
    fullname: string;
    email: string;
    isVerified: boolean;
};

type UserState = {
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    loading: boolean;
    signup: (input: SignupInputState) => Promise<boolean>;
    login: (input: LoginInputState) => Promise<boolean>;
    checkAuthentication: () => Promise<boolean>;
    logout: () => Promise<boolean>;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: true,
            loading: false,
            signup: async (input: SignupInputState) => {
                set({ loading: true });

                try {
                    const response = await api.post('/user/signup', input);
                    if (!response.data?.success) {
                        const message = response.data?.message || 'Failed to create account';
                        toast.error(message);
                        return false;
                    }

                    toast.success(response.data.message);
                    set({ user: response.data.user, isAuthenticated: true });
                    return true;
                } catch (error) {
                    const message = getApiErrorMessage(error, 'Failed to create account');
                    toast.error(message);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            login: async (input: LoginInputState) => {
                set({ loading: true });

                try {
                    const response = await api.post('/user/login', input);
                    if (!response.data?.success) {
                        const message = response.data?.message || 'Failed to sign in';
                        toast.error(message);
                        return false;
                    }

                    toast.success(response.data.message);
                    set({ user: response.data.user, isAuthenticated: true });
                    return true;
                } catch (error) {
                    const message = getApiErrorMessage(error, 'Failed to sign in');
                    toast.error(message);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },
            checkAuthentication: async () => {
                set({ isCheckingAuth: true });

                try {
                    const response = await api.get('/user/check-auth');
                    if (!response.data?.success) {
                        set({ user: null, isAuthenticated: false });
                        return false;
                    }

                    set({ user: response.data.user, isAuthenticated: true });
                    return true;
                } catch {
                    set({ user: null, isAuthenticated: false });
                    return false;
                } finally {
                    set({ isCheckingAuth: false });
                }
            },
            logout: async () => {
                set({ loading: true });

                try {
                    const response = await api.post('/user/logout');
                    if (!response.data?.success) {
                        const message = response.data?.message || 'Failed to sign out';
                        toast.error(message);
                        return false;
                    }

                    toast.success(response.data.message);
                    set({ user: null, isAuthenticated: false });
                    return true;
                } catch (error) {
                    const message = getApiErrorMessage(error, 'Failed to sign out');
                    toast.error(message);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'user-name',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);