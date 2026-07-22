import React from 'react';

export default function ComingSoon({ moduleName }: { moduleName: string }) {
  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-title">{moduleName}</div>
      </div>
      <div className="card empty-state">
        {moduleName} is being built in the next phase. Check back soon.
      </div>
    </div>
  );
}
