export default function TopBar({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0" style={{ background: '#dce7f5' }}>
      <div>
        <h1 className="text-textprimary font-semibold text-base">{title}</h1>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
