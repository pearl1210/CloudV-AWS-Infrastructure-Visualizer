import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

export default function Navbar() {
  const { user, logout, loading } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-sm">☁️</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">CloudV</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.fullname}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}