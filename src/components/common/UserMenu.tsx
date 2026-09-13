import { LogOut, Settings, SlidersHorizontal, UserRound } from "lucide-react";

const items = [
  { label: "Profile", icon: UserRound },
  { label: "Preferences", icon: SlidersHorizontal },
  { label: "System Settings", icon: Settings },
];

export default function UserMenu({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="animate-fade-in glass-panel absolute right-0 top-11 z-50 w-56 rounded-xl p-2 border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-[13px] font-semibold text-text-primary">Ganesh Singh</p>
          <p className="text-[11px] text-text-secondary">Operations Analyst</p>
        </div>
        <div className="py-1.5">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <div className="border-t border-border pt-1.5">
          <button className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
