import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">☁</span>
        </div>
        <Loader className="animate-spin w-10 h-10 text-blue-600 mx-auto" />
        <p className="mt-4 text-sm font-medium text-gray-800">Loading CloudV</p>
        <p className="mt-1 text-xs text-gray-500">Preparing your workspace...</p>
      </div>
    </div>
  );
};

export default Loading;