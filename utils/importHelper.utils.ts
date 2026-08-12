"use client";

export function parse_skills(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  const val_str = String(val).trim();
  if (!val_str) return [];
  const parts = val_str.split(/\s*[\-,|]\s*/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function parse_time_slot(val: any): { enabled: boolean; start_time: string | null; end_time: string | null } {
  if (!val) return { enabled: false, start_time: null, end_time: null };
  const val_str = String(val).trim().toUpperCase();
  if (["NA", "N/A", "OFF", "NONE", "-", ""].includes(val_str)) {
    return { enabled: false, start_time: null, end_time: null };
  }

  const parts = val_str.split(/\s*-\s*|\s+TO\s+/);
  if (parts.length === 2) {
    const parse_single = (p: string): string | null => {
      p = p.trim();
      const m_hm = p.match(/^(\d{1,2}):(\d{2})$/);
      if (m_hm) {
        const h = parseInt(m_hm[1], 10);
        const m = parseInt(m_hm[2], 10);
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
      const m_h = p.match(/^(\d{1,2})\s*(H|AM|PM)?$/);
      if (m_h) {
        let h = parseInt(m_h[1], 10);
        const mod = m_h[2];
        if (mod === "PM" && h < 12) h += 12;
        if (h === 24) return "23:59";
        return `${h.toString().padStart(2, "0")}:00`;
      }
      return null;
    };

    const start = parse_single(parts[0]);
    const end = parse_single(parts[1]);
    if (start && end) {
      return { enabled: true, start_time: start, end_time: end };
    }
  }

  return { enabled: false, start_time: null, end_time: null };
}

export function infer_vehicle_type(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("bus")) return "bus";
  if (n.includes("van")) return "van";
  if (n.includes("truck")) return "truck";
  if (n.includes("bike")) return "bike";
  if (n.includes("scooter")) return "scooter";
  if (n.includes("car")) return "car";
  return "van";
}
