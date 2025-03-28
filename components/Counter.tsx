"use client";

import { useState } from "react";

interface CounterProps {
  initialCount?: number;
}

export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setCount(count - 1)}
        className="px-3 py-1 bg-brand text-white rounded hover:bg-brand/90 transition-colors"
      >
        -
      </button>
      <span className="text-lg font-medium">{count}</span>
      <button
        onClick={() => setCount(count + 1)}
        className="px-3 py-1 bg-brand text-white rounded hover:bg-brand/90 transition-colors"
      >
        +
      </button>
    </div>
  );
}
