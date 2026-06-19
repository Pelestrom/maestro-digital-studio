// E.164 country dial codes (curated common list — extend as needed)
export type Country = { code: string; name: string; dial: string; flag: string };

export const COUNTRIES: Country[] = [
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "GN", name: "Guinée", dial: "+224", flag: "🇬🇳" },
  { code: "GA", name: "Gabon", dial: "+241", flag: "🇬🇦" },
  { code: "CG", name: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "CD", name: "RD Congo", dial: "+243", flag: "🇨🇩" },
  { code: "DZ", name: "Algérie", dial: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "EG", name: "Égypte", dial: "+20", flag: "🇪🇬" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { code: "LU", name: "Luxembourg", dial: "+352", flag: "🇱🇺" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "IT", name: "Italie", dial: "+39", flag: "🇮🇹" },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "NL", name: "Pays-Bas", dial: "+31", flag: "🇳🇱" },
  { code: "AE", name: "Émirats arabes unis", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Arabie saoudite", dial: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "TR", name: "Turquie", dial: "+90", flag: "🇹🇷" },
  { code: "BR", name: "Brésil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexique", dial: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentine", dial: "+54", flag: "🇦🇷" },
  { code: "ZA", name: "Afrique du Sud", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigéria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "CN", name: "Chine", dial: "+86", flag: "🇨🇳" },
  { code: "JP", name: "Japon", dial: "+81", flag: "🇯🇵" },
  { code: "IN", name: "Inde", dial: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australie", dial: "+61", flag: "🇦🇺" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function findCountryByCode(code?: string | null): Country {
  if (!code) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

/** Strip non-digits and prefix dial code. Returns full E.164 string e.g. "+212612345678". */
export function toE164(dial: string, local: string): string {
  const digits = local.replace(/\D/g, "").replace(/^0+/, "");
  return `${dial}${digits}`;
}

/** Loose E.164 validation: starts with +, 8-15 digits total. */
export function isValidE164(s: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(s);
}
