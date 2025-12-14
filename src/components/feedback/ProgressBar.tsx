import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Section {current} of {total}</span>
          <span>{Math.round(percentage)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
