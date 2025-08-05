import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Menu } from 'lucide-react';

interface SidebarNavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarNavItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
}

const Sidebar: React.FC<SidebarProps> = ({ sections }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white border shadow"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`
          fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] flex flex-col bg-gray-50 border-r p-6 z-50
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
        `}
      >
        <nav>
          {sections.map((section) => (
            <div className="mb-6" key={section.title}>
              <div className="text-xs font-semibold text-gray-500 mb-2">{section.title}</div>
              <ul className="space-y-1">
                {section.items.map(({ label, icon: Icon, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-800 hover:bg-primary/5 transition
                        ${location.pathname === to ? 'bg-primary/10 font-semibold border-r-4 border-primary' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon
                        className={`w-5 h-5 ${location.pathname === to ? 'text-primary' : ''}`}
                      />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
