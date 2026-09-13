import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, Mail, Shield, User, UserPlus, X } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Close on Escape & prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setNotice("Please fill in all registration fields.");
      return;
    }
    if (password !== confirmPassword) {
      setNotice("Passwords do not match.");
      return;
    }
    // No fake auth: clearly inform user regarding agency access credentials
    setNotice(
      "Registration request recorded for organizational review. Maritime & environmental authority clearance is required for live telemetry access."
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-[4px] p-3 sm:p-4 transition-all"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        className="relative z-[100000] w-full max-w-[440px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 shadow-2xl text-[var(--text-primary)] animate-fade-in"
        style={{ maxWidth: "min(440px, calc(100vw - 24px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 id="register-modal-title" className="text-[15px] font-bold text-[var(--text-primary)] leading-tight">
                Register / Sign Up
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                AeroMarine-AI Maritime Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice/Alert if any */}
        {notice && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11.5px] text-amber-600 dark:text-amber-400 leading-relaxed">
            {notice}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Capt. Sarah Jensen"
                className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] py-2 pl-9 pr-3 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@maritime-authority.gov"
                className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] py-2 pl-9 pr-3 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] py-2 pl-9 pr-3 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[var(--text-secondary)] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] py-2 pl-9 pr-3 text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="focus-ring w-full rounded-lg border border-[var(--border-strong)] bg-[var(--card)] py-2.5 text-[13px] font-semibold text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-hover)] transition-all"
            >
              Register / Sign Up
            </button>
          </div>
        </form>

        <div className="mt-4 border-t border-[var(--border)] pt-3 text-center text-[11.5px] text-[var(--text-muted)]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() =>
              setNotice("AeroMarine-AI Single Sign-On is managed by your port command administrator.")
            }
            className="font-semibold text-[var(--text-primary)] hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
