import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeShortLinkResolveState,
  type ShortLinkResolveRow,
} from "./resolve-state.js";

describe("computeShortLinkResolveState", () => {
  const now = new Date("2026-06-30T12:00:00.000Z");
  const baseRow: ShortLinkResolveRow = {
    status: "active",
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
  };

  it("returns active for valid row", () => {
    assert.equal(computeShortLinkResolveState(baseRow, now), "active");
  });

  it("returns expired when past expiresAt", () => {
    assert.equal(
      computeShortLinkResolveState(
        { ...baseRow, expiresAt: new Date("2026-01-01T00:00:00.000Z") },
        now,
      ),
      "expired",
    );
  });

  it("returns revoked for revoked status", () => {
    assert.equal(
      computeShortLinkResolveState({ ...baseRow, status: "revoked" }, now),
      "revoked",
    );
  });

  it("returns not_found for null or deleted rows", () => {
    assert.equal(computeShortLinkResolveState(null, now), "not_found");
    assert.equal(
      computeShortLinkResolveState({ ...baseRow, deletedAt: now }, now),
      "not_found",
    );
  });
});
