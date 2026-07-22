import React from 'react';

export default function RestrictedModule() {
  return (
    <div className="app-content">
      <div className="card empty-state" style={{ marginTop: 60 }}>
        You don't have access to this section. If you think that's wrong,
        check with Jordan or Nelson.
      </div>
    </div>
  );
}
