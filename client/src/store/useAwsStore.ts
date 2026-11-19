import { create } from 'zustand';
import { toast } from 'sonner';
import type { AWSAccount, AppGraph } from '@/types';
import { api, getApiErrorMessage } from '@/lib/api';

interface AWSState {
  accounts: AWSAccount[];
  selectedAccount: AWSAccount | null;
  apps: string[];
  currentGraph: AppGraph | null;
  isLoadingAccounts: boolean;
  isLoadingApps: boolean;
  isLoadingGraph: boolean;
  error: string | null;

  fetchAccounts: () => Promise<boolean>;
  connectAccount: (data: {
    accountName: string;
    roleArn: string;
    awsAccountId: string;
    region: string;
  }) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  selectAccount: (account: AWSAccount | null) => void;
  fetchApps: (accountId: string, tagKey?: string) => Promise<boolean>;
  fetchGraph: (
    accountId: string,
    appTag: string,
    tagKey?: string,
    refresh?: boolean
  ) => Promise<boolean>;
  clearGraph: () => void;
}

export const useAWSStore = create<AWSState>((set) => ({
  accounts: [],
  selectedAccount: null,
  apps: [],
  currentGraph: null,
  isLoadingAccounts: false,
  isLoadingApps: false,
  isLoadingGraph: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoadingAccounts: true, error: null });

    try {
      const response = await api.get('/aws/accounts');

      set({
        accounts: response.data.accounts ?? [],
        isLoadingAccounts: false,
        error: null,
      });
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load AWS accounts');

      toast.error(message);

      set({
        error: message,
        isLoadingAccounts: false,
      });
      return false;
    }
  },

  connectAccount: async (payload) => {
    set({ error: null });

    try {
      const response = await api.post('/aws/connect', payload);

      toast.success(response.data.message);

      set((state) => ({
        accounts: [response.data.account, ...state.accounts],
        error: null,
      }));
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to connect AWS account');

      toast.error(message);

      set({ error: message });
      return false;
    }
  },

  deleteAccount: async (id) => {
    set({ error: null });

    try {
      const response = await api.delete(`/aws/accounts/${id}`);

      toast.success(response.data.message);

      set((state) => ({
        accounts: state.accounts.filter((a) => a._id !== id),
        selectedAccount:
          state.selectedAccount?._id === id ? null : state.selectedAccount,
        apps:
          state.selectedAccount?._id === id ? [] : state.apps,
        currentGraph:
          state.selectedAccount?._id === id ? null : state.currentGraph,
        error: null,
      }));
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete AWS account');

      toast.error(message);

      set({ error: message });
      return false;
    }
  },

  selectAccount: (account) =>
    set({
      selectedAccount: account,
      apps: [],
      currentGraph: null,
      error: null,
    }),

  fetchApps: async (accountId, tagKey = "Application") => {
    set({ isLoadingApps: true, error: null });

    try {
      const response = await api.get(`/aws/accounts/${accountId}/apps`, {
        params: { tagKey },
      });

      set({
        apps: response.data.apps ?? [],
        isLoadingApps: false,
        error: null,
      });
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load applications');

      toast.error(message);

      set({
        error: message,
        isLoadingApps: false,
      });
      return false;
    }
  },

  fetchGraph: async (
    accountId,
    appTag,
    tagKey = "Application",
    refresh = false
  ) => {
    set({
      isLoadingGraph: true,
      error: null,
      currentGraph: null,
    });

    try {
      const response = await api.get(
        `/aws/accounts/${accountId}/apps/${encodeURIComponent(appTag)}/graph`,
        {
          params: { tagKey, refresh },
        }
      );

      set({
        currentGraph: response.data,
        isLoadingGraph: false,
        error: null,
      });
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load infrastructure graph');

      toast.error(message);

      set({
        error: message,
        isLoadingGraph: false,
      });
      return false;
    }
  },

  clearGraph: () => set({ currentGraph: null, error: null }),
}));