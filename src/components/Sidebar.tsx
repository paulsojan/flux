"use client";

type SidebarProps = {
  currentView: string;
  onNavigate: (view: "inbox" | "sent" | "compose") => void;
};

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "inbox" as const, label: "Inbox" },
    { id: "sent" as const, label: "Sent" },
    { id: "compose" as const, label: "Compose" },
  ];

  return (
    <nav className="w-56 shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 gap-1">
      <h2 className="text-lg font-semibold mb-4 px-3">AI Mail</h2>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`text-left px-3 py-2 rounded-lg transition-colors ${
            currentView === item.id
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium"
              : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
