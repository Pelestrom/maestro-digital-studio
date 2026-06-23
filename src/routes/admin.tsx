import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/queries";
import {
  bootstrapAdmin,
  isCurrentUserAdmin,
  adminListMessages,
  adminListProjects,
  adminMarkMessageRead,
  adminDeleteMessage,
  adminSetMessageStatus,
} from "@/lib/admin.functions";
import { CoverUploader, GalleryUploader } from "@/components/admin/MediaUploader";

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

type MsgStatus = "new" | "read" | "in_progress" | "replied" | "archived";
type Msg = {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  whatsapp: string | null;
  country_code: string | null;
  status: MsgStatus;
  source_page: string | null;
  ip_address: string | null;
};

const STATUS_LABELS: Record<MsgStatus, string> = {
  new: "Nouveau",
  read: "Lu",
  in_progress: "En cours",
  replied: "Répondu",
  archived: "Archivé",
};

type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  cover_image: string | null;
  cover_position: string;
  gallery_images: string[];
  client: string | null;
  year: number | null;
  tools: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

const EMPTY_PROJECT: Omit<Project, "id"> = {
  title: "",
  slug: "",
  category: CATEGORIES[0].slug,
  description: "",
  cover_image: "",
  cover_position: "50% 50%",
  gallery_images: [],
  client: "",
  year: new Date().getFullYear(),
  tools: [],
  tags: [],
  is_published: true,
  is_featured: false,
  sort_order: 0,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"messages" | "projects">("projects");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | (Omit<Project, "id"> & { id?: string }) | null>(null);

  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listMessages = useServerFn(adminListMessages);
  const listProjects = useServerFn(adminListProjects);
  const markRead = useServerFn(adminMarkMessageRead);
  const setStatus = useServerFn(adminSetMessageStatus);
  const delMsg = useServerFn(adminDeleteMessage);
  const bootstrap = useServerFn(bootstrapAdmin);

  useEffect(() => {
    bootstrap().catch((e) => console.error("bootstrap admin failed", e));
  }, [bootstrap]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      setMessages([]);
      setProjects([]);
      return;
    }
    (async () => {
      try {
        const { isAdmin } = await checkAdmin();
        setIsAdmin(isAdmin);
        if (isAdmin) {
          const msgs = (await listMessages()) as Msg[];
          setMessages(msgs);
          await refreshProjects();
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [session, checkAdmin, listMessages]);

  async function refreshProjects() {
    try {
      const data = (await listProjects()) as Project[];
      setProjects(data ?? []);
    } catch (e) {
      console.error("refreshProjects failed:", e);
      setProjects([]);
    }
  }

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
  async function changeStatus(m: Msg, status: MsgStatus) {
    await setStatus({ data: { id: m.id, status } });
    await refresh();
  }
  async function remove(m: Msg) {
    if (!confirm("Supprimer ce message ?")) return;
    await delMsg({ data: { id: m.id } });
    await refresh();
  }

  // -------- Projects CRUD (uses RLS — admin is authenticated) --------
  async function saveProject() {
    if (!editing) return;
    const slug = editing.slug?.trim() || slugify(editing.title);
    const payload: any = {
      title: editing.title,
      slug,
      category: editing.category,
      description: editing.description || null,
      cover_image: editing.cover_image || null,
      cover_position: editing.cover_position || "50% 50%",
      gallery_images: editing.gallery_images || [],
      client: editing.client || null,
      year: editing.year ? Number(editing.year) : null,
      tools: editing.tools || [],
      tags: editing.tags || [],
      is_published: editing.is_published,
      is_featured: editing.is_featured,
      sort_order: Number(editing.sort_order) || 0,
    };
    let res;
    if ("id" in editing && editing.id) {
      res = await supabase.from("projects" as any).update(payload).eq("id", editing.id);
    } else {
      res = await supabase.from("projects" as any).insert(payload);
    }
    if (res.error) {
      alert("Erreur : " + res.error.message);
      return;
    }
    setEditing(null);
    await refreshProjects();
  }

  async function deleteProject(p: Project) {
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    const { error } = await supabase.from("projects" as any).delete().eq("id", p.id);
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    await refreshProjects();
  }

  // -------- Render --------
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

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="label-mono text-xs" style={{ color: "var(--color-blue-accent)" }}>
              Admin
            </div>
            <h1 className="font-display text-4xl mt-1">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("projects")}
              className={`rounded-full px-4 py-2 text-xs label-mono border ${tab === "projects" ? "bg-foreground text-background" : ""}`}
              style={{ borderColor: "var(--color-border)" }}
            >
              Projets ({projects.length})
            </button>
            <button
              onClick={() => setTab("messages")}
              className={`rounded-full px-4 py-2 text-xs label-mono border ${tab === "messages" ? "bg-foreground text-background" : ""}`}
              style={{ borderColor: "var(--color-border)" }}
            >
              Messages ({messages.length}{unread ? ` · ${unread} nouveau` : ""})
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full px-4 py-2 text-xs label-mono border"
              style={{ borderColor: "var(--color-border)" }}
            >
              Se déconnecter
            </button>
          </div>
        </header>

        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Aucun message pour le moment.
              </p>
            )}
            {messages.map((m) => {
              const waDigits = (m.whatsapp ?? "").replace(/\D/g, "");
              return (
                <article
                  key={m.id}
                  className={`rounded-xl border p-5 transition ${m.status === "archived" ? "opacity-60" : ""}`}
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-lg">{m.name}</h2>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full label-mono"
                          style={{
                            background:
                              m.status === "new"
                                ? "var(--color-blue-accent)"
                                : m.status === "replied"
                                ? "#16a34a"
                                : m.status === "in_progress"
                                ? "#f59e0b"
                                : m.status === "archived"
                                ? "#6b7280"
                                : "#94a3b8",
                            color: "#fff",
                          }}
                        >
                          {STATUS_LABELS[m.status].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                        {m.whatsapp && (
                          <span className="inline-flex items-center gap-2">
                            <a
                              href={`https://wa.me/${waDigits}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: "#16a34a" }}
                            >
                              {m.whatsapp}
                            </a>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(m.whatsapp!)}
                              className="text-[10px] underline opacity-70 hover:opacity-100"
                              title="Copier le numéro"
                            >
                              copier
                            </button>
                          </span>
                        )}
                        {m.project_type && <span>· {m.project_type}</span>}
                        {m.source_page && <span>· {m.source_page}</span>}
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString("fr-FR")}
                    </time>
                  </div>
                  <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
                  <div className="mt-4 flex gap-2 flex-wrap items-center">
                    <select
                      value={m.status}
                      onChange={(e) => changeStatus(m, e.target.value as MsgStatus)}
                      className="rounded-full px-3 py-1.5 text-[11px] label-mono border bg-transparent"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {(Object.keys(STATUS_LABELS) as MsgStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: votre message")}`}
                      className="rounded-full px-3 py-1.5 text-[11px] label-mono border"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      Répondre par email
                    </a>
                    {m.whatsapp && (
                      <a
                        href={`https://wa.me/${waDigits}?text=${encodeURIComponent(`Bonjour ${m.name.split(" ")[0]}, merci pour votre message…`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full px-3 py-1.5 text-[11px] label-mono border"
                        style={{ borderColor: "var(--color-border)", color: "#16a34a" }}
                      >
                        Ouvrir WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => toggleRead(m)}
                      className="rounded-full px-3 py-1.5 text-[11px] label-mono border"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {m.is_read ? "Marquer non lu" : "Marquer lu"}
                    </button>
                    <button
                      onClick={() => remove(m)}
                      className="rounded-full px-3 py-1.5 text-[11px] label-mono border text-red-500 ml-auto"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Gérez les projets affichés sur le portfolio public.
              </p>
              <button
                onClick={() => setEditing({ ...EMPTY_PROJECT })}
                className="rounded-full px-4 py-2 text-xs label-mono"
                style={{ background: "var(--color-blue-accent)", color: "#fff" }}
              >
                + Nouveau projet
              </button>
            </div>

            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground py-12 text-center border rounded-xl"
                 style={{ borderColor: "var(--color-border)" }}>
                Aucun projet. Cliquez sur « Nouveau projet » pour en ajouter.
              </p>
            )}

            <div className="grid gap-3">
              {projects.map((p) => {
                const cat = CATEGORIES.find((c) => c.slug === p.category);
                return (
                  <article
                    key={p.id}
                    className="rounded-xl border p-4 flex items-center gap-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted"
                      style={{ background: p.cover_image ? undefined : cat?.color }}
                    >
                      {p.cover_image && (
                        <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg truncate">{p.title}</h3>
                        {!p.is_published && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full label-mono border"
                                style={{ borderColor: "var(--color-border)" }}>
                            BROUILLON
                          </span>
                        )}
                        {p.is_featured && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full label-mono"
                                style={{ background: "var(--color-blue-accent)", color: "#fff" }}>
                            EN VEDETTE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {cat?.emoji} {cat?.label} · /{p.slug}
                        {p.client ? ` · ${p.client}` : ""}
                        {p.year ? ` · ${p.year}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-full px-3 py-1.5 text-[11px] label-mono border"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => deleteProject(p)}
                        className="rounded-full px-3 py-1.5 text-[11px] label-mono border text-red-500"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <ProjectEditor
          value={editing}
          onChange={setEditing}
          onSave={saveProject}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProjectEditor({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: any;
  onChange: (v: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (patch: any) => onChange({ ...value, ...patch });
  const isNew = !value.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", overscrollBehavior: "contain" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="bg-background rounded-2xl border w-full max-w-2xl max-h-[85vh] flex flex-col"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="p-6 border-b flex items-center justify-between gap-4 flex-shrink-0"
             style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-display text-2xl">
            {isNew ? "Nouveau projet" : "Éditer le projet"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-foreground/5 transition-colors flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6 L18 18 M18 6 L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1" style={{ overscrollBehavior: "contain" }}>
          <Field label="Titre *">
            <input
              required
              value={value.title}
              onChange={(e) => set({ title: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: "var(--color-border)" }}
            />
          </Field>
          <Field label="Slug (URL)" hint="Laisser vide pour générer depuis le titre">
            <input
              value={value.slug}
              onChange={(e) => set({ slug: e.target.value })}
              placeholder={slugify(value.title || "")}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent font-mono"
              style={{ borderColor: "var(--color-border)" }}
            />
          </Field>
          <Field label="Catégorie *">
            <select
              value={value.category}
              onChange={(e) => set({ category: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: "var(--color-border)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={value.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: "var(--color-border)" }}
            />
          </Field>
          <Field label="Image de couverture">
            <CoverUploader
              value={value.cover_image ?? ""}
              onChange={(url) => set({ cover_image: url })}
              slugHint={value.slug || slugify(value.title || "")}
            />
          </Field>
          {value.cover_image && (
            <Field label="Cadrage de la couverture (zone visible)">
              <CoverPositionEditor
                src={value.cover_image}
                value={value.cover_position || "50% 50%"}
                onChange={(pos) => set({ cover_position: pos })}
              />
            </Field>
          )}
          <Field label="Galerie">
            <GalleryUploader
              value={value.gallery_images || []}
              onChange={(urls) => set({ gallery_images: urls })}
              slugHint={value.slug || slugify(value.title || "")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client">
              <input
                value={value.client ?? ""}
                onChange={(e) => set({ client: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--color-border)" }}
              />
            </Field>
            <Field label="Année">
              <input
                type="number"
                value={value.year ?? ""}
                onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--color-border)" }}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Outils (séparés par virgule)">
              <input
                value={(value.tools || []).join(", ")}
                onChange={(e) =>
                  set({
                    tools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--color-border)" }}
              />
            </Field>
            <Field label="Tags (séparés par virgule)">
              <input
                value={(value.tags || []).join(", ")}
                onChange={(e) =>
                  set({
                    tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--color-border)" }}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Field label="Ordre de tri">
              <input
                type="number"
                value={value.sort_order ?? 0}
                onChange={(e) => set({ sort_order: Number(e.target.value) })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: "var(--color-border)" }}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm pt-5">
              <input
                type="checkbox"
                checked={value.is_published}
                onChange={(e) => set({ is_published: e.target.checked })}
              />
              Publié
            </label>
            <label className="flex items-center gap-2 text-sm pt-5">
              <input
                type="checkbox"
                checked={value.is_featured}
                onChange={(e) => set({ is_featured: e.target.checked })}
              />
              En vedette
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2 flex-shrink-0 bg-background"
             style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-xs label-mono border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={!value.title}
            className="rounded-full px-5 py-2 text-xs label-mono disabled:opacity-50"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="label-mono text-xs">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CoverPositionEditor({
  src,
  value,
  onChange,
}: {
  src: string;
  value: string;
  onChange: (pos: string) => void;
}) {
  const parsed = (() => {
    const [x, y] = (value || "50% 50%").split(" ").map((s) => parseFloat(s));
    return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
  })();

  const update = (x: number, y: number) =>
    onChange(`${Math.round(x)}% ${Math.round(y)}%`);

  return (
    <div className="space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-lg border cursor-crosshair"
        style={{ borderColor: "var(--color-border)", aspectRatio: "16 / 9" }}
        onClick={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          update(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
        }}
      >
        <img
          src={src}
          alt="Aperçu cadrage"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${parsed.x}% ${parsed.y}%` }}
        />
        <div
          className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{ left: `${parsed.x}%`, top: `${parsed.y}%`, background: "var(--color-blue-accent)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="label-mono">Horizontal · {Math.round(parsed.x)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={parsed.x}
            onChange={(e) => update(Number(e.target.value), parsed.y)}
            className="w-full"
          />
        </label>
        <label className="space-y-1">
          <span className="label-mono">Vertical · {Math.round(parsed.y)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={parsed.y}
            onChange={(e) => update(parsed.x, Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Cliquez sur l'image ou utilisez les curseurs pour choisir la zone à afficher.
      </p>
    </div>
  );
}

