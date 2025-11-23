import React from "react";

export const SkeletonCard = () => {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex space-x-4">
        <div className="skeleton w-16 h-16 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-3/4 rounded"></div>
          <div className="skeleton h-3 w-1/2 rounded"></div>
          <div className="skeleton h-3 w-2/3 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 1, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton h-4 rounded"
          style={{ width: index === lines - 1 ? "70%" : "100%" }}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonButton = () => {
  return <div className="skeleton h-10 w-24 rounded-lg"></div>;
};

export const SkeletonAvatar = () => {
  return <div className="skeleton w-12 h-12 rounded-full"></div>;
};
