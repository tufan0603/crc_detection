"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanLine, Clock, Info, Activity } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan",    label: "New Scan",  icon: ScanLine },
  { href: "/history", label: "History",   icon: Clock },
  { href: "/about",   label: "About",     icon: Info },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col border-r border-border" style={{ background: '#d8e3f3' }}>
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0">
            <Activity size={13} className="text-white" />
          </div>
          <div>
            <p className="text-textprimary font-semibold text-sm leading-tight">CancerDetect</p>
            <p className="text-muted text-[10px]">AI Diagnostic Tool</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/70 text-primary shadow-sm"
                  : "text-textsub hover:text-textprimary hover:bg-white/40"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
              )}
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/70">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-xs text-textsub font-medium">Models Online</span>
        </div>
        <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
          DenseNet · ResNet · EfficientNet
        </p>
      </div>
    </aside>
  );
}
