import { describe, it, expect } from "vitest";
import {
  buildPaginationItems,
  paginationItemKey,
  PAGINATION_ELLIPSIS,
} from "../../client/shared/utils/pagination.js";

function keysFor(currentPage, totalPages) {
  const items = buildPaginationItems(currentPage, totalPages);
  return items.map((item, i) => paginationItemKey(item, i));
}

function assertUniqueKeys(currentPage, totalPages) {
  const keys = keysFor(currentPage, totalPages);
  expect(new Set(keys).size).toBe(keys.length);
  return keys;
}

describe("buildPaginationItems", () => {
  it("returns contiguous pages when gaps are absent", () => {
    expect(buildPaginationItems(1, 4)).toEqual([1, 2, PAGINATION_ELLIPSIS, 4]);
    expect(buildPaginationItems(3, 4)).toEqual([1, 2, 3, 4]);
  });

  it("inserts ellipsis for large page counts", () => {
    expect(buildPaginationItems(9, 10)).toEqual([1, PAGINATION_ELLIPSIS, 8, 9, 10]);
    expect(buildPaginationItems(5, 10)).toEqual([1, PAGINATION_ELLIPSIS, 4, 5, 6, PAGINATION_ELLIPSIS, 10]);
  });

  it("never produces duplicate page numbers", () => {
    for (let total = 1; total <= 25; total++) {
      for (let current = 1; current <= total; current++) {
        const nums = buildPaginationItems(current, total).filter((x) => typeof x === "number");
        expect(new Set(nums).size).toBe(nums.length);
      }
    }
  });
});

describe("paginationItemKey", () => {
  it("never creates duplicate keys", () => {
    const items = buildPaginationItems(5, 20);
    const keys = items.map((item, i) => paginationItemKey(item, i));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("never collides between ellipsis index 1 and page 1", () => {
    const items = buildPaginationItems(9, 10);
    const keys = items.map((item, i) => paginationItemKey(item, i));
    expect(keys).toContain("page-1");
    expect(keys).toContain("ellipsis-1");
    expect(keys.filter((k) => k === "page-1")).toHaveLength(1);
  });

  it("stays unique for every page position up to 50 pages", () => {
    for (let total = 1; total <= 50; total++) {
      for (let current = 1; current <= total; current++) {
        assertUniqueKeys(current, total);
      }
    }
  });
});
