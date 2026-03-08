import { useState, useCallback } from "react";
import { RefreshCw, Lock, Check, AlertTriangle, LogOut, ImageIcon } from "lucide-react";

/**
 * Admin Page – Password-protected, server-side auth.
 * Password is NEVER stored in the frontend bundle.
 * Auth flow: password → /api/admin-verify → sessionStorage token.
 */

interface SyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  folderStats: Record<string, number>;
  folderErrors?: Record<string, string>;
  totalImages: number;
}

export function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  );
  const [storedPassword, setStoredPassword] = useState(
    () => sessionStorage.getItem("admin_pw") || ""
  );
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState("");

  // ── Login ──
  const handleLogin = useCallback(async () => {
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setAuthError("Falsches Passwort");
        return;
      }

      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_pw", password);
      setStoredPassword(password);
      setIsAuthenticated(true);
    } catch {
      setAuthError("Verbindungsfehler");
    } finally {
      setAuthLoading(false);
    }
  }, [password]);

  // ── Logout ──
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_pw");
    setIsAuthenticated(false);
    setStoredPassword("");
    setPassword("");
    setSyncResult(null);
    setSyncError("");
  }, []);

  // ── Sync ──
  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncError("");
    setSyncResult(null);

    try {
      const res = await fetch("/api/sync-imagekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: storedPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSyncError(data.details ? `${data.error}: ${data.details}` : (data.error || `Sync fehlgeschlagen (${res.status})`));
        return;
      }

      setSyncResult(data);
    } catch {
      setSyncError("Verbindungsfehler – bitte erneut versuchen");
    } finally {
      setSyncing(false);
    }
  }, [storedPassword]);

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 mb-4">
              <Lock className="w-6 h-6 text-white/40" />
            </div>
            <h1 className="text-white/80 text-[1.1rem] tracking-wide">
              Admin
            </h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-[0.95rem]"
            />

            {authError && (
              <p className="text-red-400 text-[0.85rem] text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || authLoading}
              className="w-full py-3 bg-white text-black rounded-lg text-[0.95rem] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {authLoading ? "..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-white/80 text-[1.2rem] tracking-wide">
            Admin
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[0.85rem] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>

        {/* Sync Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h2 className="text-white/90 text-[1.05rem] mb-1">
                Bilder synchronisieren
              </h2>
              <p className="text-white/40 text-[0.85rem]" style={{ lineHeight: 1.6 }}>
                Liest alle Bilder aus ImageKit aus und aktualisiert das Google Sheet
                &bdquo;Bilder&ldquo;-Tab mit URLs und SEO Alt-Tags.
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white text-black rounded-lg text-[0.95rem] hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Synchronisiere..." : "Jetzt synchronisieren"}
          </button>

          {/* Success */}
          {syncResult && (
            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-[0.9rem]">
                  Erfolgreich synchronisiert
                </span>
              </div>
              <p className="text-white/60 text-[0.85rem] mb-4">
                {syncResult.totalImages} Bilder ins Google Sheet geschrieben
              </p>

              {/* Folder breakdown */}
              <div className="space-y-1.5">
                {Object.entries(syncResult.folderStats).map(
                  ([folder, count]) => (
                    <div
                      key={folder}
                      className="flex items-center justify-between text-[0.8rem]"
                    >
                      <span className="text-white/40 font-mono">
                        {folder}
                      </span>
                      <span className="text-white/60">{count}</span>
                    </div>
                  )
                )}
              </div>

              {/* Folder errors */}
              {syncResult.folderErrors && (
                <div className="mt-4">
                  <h3 className="text-red-400 text-[0.9rem] font-bold">
                    Fehler bei bestimmten Ordnern:
                  </h3>
                  <ul className="list-disc list-inside text-red-400 text-[0.85rem]">
                    {Object.entries(syncResult.folderErrors).map(
                      ([folder, error]) => (
                        <li key={folder}>
                          {folder}: {error}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <p className="text-white/30 text-[0.75rem] mt-4">
                {new Date(syncResult.syncedAt).toLocaleString("de-AT")}
              </p>
            </div>
          )}

          {/* Error */}
          {syncError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-[0.9rem]">
                  {syncError}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-white/20 text-[0.75rem] text-center mt-8" style={{ lineHeight: 1.6 }}>
          Nach dem Sync dauert es bis zu 5 Minuten, bis die neuen Bilder
          auf der Website erscheinen (Cache).
        </p>
      </div>
    </div>
  );
}