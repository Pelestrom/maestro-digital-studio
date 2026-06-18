import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapAdmin,
  isCurrentUserAdmin,
  adminListMessages,
  adminMarkMessageRead,
  adminDeleteMessage,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Msg = {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);

  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listMessages = useServerFn(adminListMessages);
  const markRead = useServerFn(adminMarkMessageRead);
  const delMsg = useServerFn(adminDeleteMessage);
  const bootstrap = useServerFn(bootstrapAdmin);

  // Bootstrap the admin account once (idempotent)
  useEffect(() => {
    bootstrap().catch((e) => console.error("bootstrap admin failed", e));
  }, [bootstrap]);

  // Track session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // When signed in, check admin & load messages
  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const { isAdmin } = await checkAdmin();
        setIsAdmin(isAdmin);
        if (isAdmin) {
          const msgs = (await listMessages()) as Msg[];
          setMessages(msgs);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [session, checkAdmin, listMessages]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function refresh() {
    const msgs = (await listMessages()) as Msg[];
    setMessages(msgs);
  }

  async function toggleRead(m: Msg) {
    await markRead({ data: { id: m.id, isRead: !m.is_read } });
    await refresh();
  }

  async function remove(m: Msg) {
    if (!confirm("Supprimer ce message ?")) return;
    await delMsg({ data: { id: m.id } });
    await refresh();
  }

  // Not signed in → login form
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 bg-background">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border p-8 space-y-5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <div className="label-mono text-xs" style={{ color: "var(--color-blue-accent)" }}>
              Admin
            </div>
            <h1 className="font-display text-3xl mt-2">Connexion</h1>
          </div>
          <div className="space-y-2">
            <label className="label-mono text-xs">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <div className="space-y-2">
            <label className="label-mono text-xs">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-5 py-2.5 text-xs label-mono disabled:opacity-50"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  // Signed in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 bg-background">
        <div className="text-center max-w-md space-y-4">
          <h1 className="font-display text-3xl">Accès refusé</h1>
          <p className="text-sm text-muted-foreground">
            Ce compte n'a pas les droits administrateur.
          </p>
          <button
            onClick={handleLogout}
            className="rounded-full px-5 py-2.5 text-xs label-mono border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  const unread = messages.filter((m) => !m.is_read).length;
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="label-mono text-xs" style={{ color: "var(--color-blue-accent)" }}>
              Admin
            </div>
            <h1 className="font-display text-4xl mt-1">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {messages.length} message{messages.length > 1 ? "s" : ""} · {unread} non lu{unread > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full px-4 py-2 text-xs label-mono border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Se déconnecter
          </button>
        </header>

        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Aucun message pour le moment.
            </p>
          )}
          {messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-5 transition ${m.is_read ? "opacity-70" : ""}`}
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg">{m.name}</h2>
                    {!m.is_read && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full label-mono"
                        style={{ background: "var(--color-blue-accent)", color: "#fff" }}
                      >
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {m.email}
                  </a>
                  {m.project_type && (
                    <span className="text-xs text-muted-foreground"> · {m.project_type}</span>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("fr-FR")}
                </time>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleRead(m)}
                  className="rounded-full px-3 py-1.5 text-[11px] label-mono border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {m.is_read ? "Marquer non lu" : "Marquer lu"}
                </button>
                <button
                  onClick={() => remove(m)}
                  className="rounded-full px-3 py-1.5 text-[11px] label-mono border text-red-500"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
