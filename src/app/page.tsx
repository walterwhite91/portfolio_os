
'use client';

import Terminal from '@/cli/Terminal';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 opacity-20 hidden md:block border border-green-900 p-2 pointer-events-none">
        <div className="text-xs text-green-700">SYS.STATUS: ONLINE</div>
        <div className="text-xs text-green-700">SECURE: YES</div>
        <div className="text-xs text-green-700">UPTIME: 99.9%</div>
      </div>

      <Terminal />
    </div>
  );
}
