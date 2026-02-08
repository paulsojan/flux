"use client";

export function AuthGate() {
  const handleLogin = () => {
    window.open(
      "http://localhost:8000/auth/login",
      "gmail-auth",
      "width=500,height=700,popup=yes"
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Sign in to Gmail</h2>
        <p className="text-gray-500 mb-6">
          Connect your Google account to manage your emails with AI assistance.
        </p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
