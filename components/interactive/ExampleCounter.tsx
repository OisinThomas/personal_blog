'use client';

import { useState } from 'react';

export default function ExampleCounter(props: Record<string, unknown>) {
  const initialValue = (props.initialValue as number) ?? 0;
  const step = (props.step as number) ?? 1;

  const [count, setCount] = useState(initialValue);

  return (
    <div className="text-center space-y-4">
      <p className="text-4xl font-bold text-primary">{count}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCount((c) => c - step)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          -{step}
        </button>
        <button
          onClick={() => setCount(initialValue)}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setCount((c) => c + step)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          +{step}
        </button>
      </div>
      <p className="text-sm text-secondary">
        An example interactive counter component
      </p>
    </div>
  );
}
