'use client';

import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    // Redirect to the dashboard tool
    window.location.href = 'http://localhost:3001'; // Dashboard tool runs on port 3001
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the dashboard tool.</p>
      </div>
    </div>
  );
}