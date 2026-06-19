export const PAGINATION_ELLIPSIS = "…";

/** Page numbers shown in the pager (always includes first, last, and neighbors of current). */
export function getVisiblePageNumbers(currentPage, totalPages) {
  if (totalPages <= 0) return [];
  return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );
}

/** e.g. [1, 2, "…", 8, 9, 10] — numbers are unique; ellipsis slots are positional. */
export function buildPaginationItems(currentPage, totalPages) {
  const pages = getVisiblePageNumbers(currentPage, totalPages);
  const items = [];
  for (let idx = 0; idx < pages.length; idx++) {
    const p = pages[idx];
    if (idx > 0 && p - pages[idx - 1] > 1) items.push(PAGINATION_ELLIPSIS);
    items.push(p);
  }
  return items;
}

export function paginationItemKey(item, index) {
  if (typeof item === "number") {
    return `page-${item}`;
  }
  return `ellipsis-${index}`;
}
