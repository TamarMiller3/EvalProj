import { useState } from 'react';

export function Section({ icon, iconBg, title, desc, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(o => !o)}>
        <div className="section-icon" style={{ background: iconBg }}>{icon}</div>
        <div>
          <div className="section-title">{title}</div>
          {desc && <div className="section-desc">{desc}</div>}
        </div>
        <div className="section-chev" style={{ marginRight: 'auto', transform: open ? 'rotate(180deg)' : '' }}>▼</div>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}
