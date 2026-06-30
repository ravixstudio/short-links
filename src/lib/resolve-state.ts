export type ShortLinkResolveState =
  | "active"
  | "expired"
  | "revoked"
  | "not_found";

export type ShortLinkResolveRow = {
  status: string;
  expiresAt: Date;
  deletedAt?: Date | null;
};

export function computeShortLinkResolveState(
  row: ShortLinkResolveRow | null,
  now: Date = new Date(),
): ShortLinkResolveState {
  if (!row || row.deletedAt) return "not_found";
  if (row.status === "revoked") return "revoked";
  if (row.status === "expired") return "expired";
  if (row.status === "active" && now > row.expiresAt) return "expired";
  if (row.status === "active") return "active";
  return "not_found";
}
