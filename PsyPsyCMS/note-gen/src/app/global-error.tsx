'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('全局错误:', error);
  }, [error]);

  function reloadPage() {
    window.location.reload();
  }

  return (
    <html lang="zh">
      <body>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">系统错误</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              应用程序遇到了问题，但我们正在努力修复。
            </p>
            <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mb-4 overflow-auto max-h-[120px]">
              {error.message || '未知错误'}
            </p>
            <div className="flex justify-end">
              <Button 
                onClick={reloadPage} 
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                重试
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
