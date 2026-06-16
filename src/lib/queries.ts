import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Use loose typing — types regenerate after migration but we keep this resilient.
type Row = Record<string, any>;

const fetchAll = async (table: string, order: { column: string; ascending?: boolean }[] = []) => {
  let q = supabase.from(table as any).select("*");
  for (const o of order) q = q.order(o.column, { ascending: o.ascending ?? true });
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Row[];
};

export const projectsQuery = () =>
  queryOptions({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const featuredProjectsQuery = () =>
  queryOptions({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(4);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const projectBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projects", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
  });

export const toolsQuery = () =>
  queryOptions({
    queryKey: ["tools"],
    queryFn: () => fetchAll("tools", [{ column: "sort_order" }]),
  });

export const skillsQuery = () =>
  queryOptions({
    queryKey: ["skills"],
    queryFn: () => fetchAll("skills", [{ column: "sort_order" }]),
  });

export const certificationsQuery = () =>
  queryOptions({
    queryKey: ["certifications"],
    queryFn: () => fetchAll("certifications", [{ column: "sort_order" }]),
  });

export const testimonialsQuery = () =>
  queryOptions({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials" as any)
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const aboutContentQuery = () =>
  queryOptions({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
  });

export const experienceQuery = () =>
  queryOptions({
    queryKey: ["experience"],
    queryFn: () => fetchAll("experience", [{ column: "sort_order" }]),
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: async () => {
      const rows = await fetchAll("settings");
      const map: Record<string, string> = {};
      for (const r of rows) map[r.key as string] = r.value as string;
      return map;
    },
  });

export const CATEGORIES = [
  { slug: "branding", label: "Branding & Identity", emoji: "🎨", color: "#3B6FCC" },
  { slug: "social-media", label: "Social Media Design", emoji: "📱", color: "#4A6FA5" },
  { slug: "print", label: "Print Design", emoji: "🖨️", color: "#5C3A1E" },
  { slug: "web-ui", label: "Web & UI Design", emoji: "🖥️", color: "#1B2A4A" },
  { slug: "presentation", label: "Presentation Design", emoji: "📊", color: "#2C5530" },
  { slug: "photo-editing", label: "Photo Editing & Manipulation", emoji: "📸", color: "#7BA7DC" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const categoryMeta = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug) ?? {
    slug,
    label: slug,
    emoji: "✦",
    color: "#3B6FCC",
  };
