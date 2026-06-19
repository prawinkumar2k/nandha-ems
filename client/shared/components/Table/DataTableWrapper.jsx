import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { buildPaginationItems, paginationItemKey, PAGINATION_ELLIPSIS } from "@/shared/utils/pagination";

export function DataTableWrapper({
  columns = [],
  data = [],
  isLoading = false,
  actions,
  pageSize = 8,
  searchPlaceholder = "Search…",
  searchKeys = [],
  emptyMessage = "No records found.",
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);

  const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
  const rowData = Array.isArray(data) ? data : [];
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const filtered = rowData.filter ? rowData.filter((row) =>
    !search ? true : keys.some((k) => {
      const val = k.includes('.') ? getNestedValue(row, k) : row[k];
      return String(val ?? "").toLowerCase().includes(search.toLowerCase());
    })
  ) : [];

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    const cmp = String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true });
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const paginationItems = buildPaginationItems(page, totalPages);

  const handleSort = (key) => {
    setSort((p) => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder={searchPlaceholder} 
            value={search} 
            onChange={handleSearch} 
            className="pl-11 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all font-medium" 
          />
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-[24px] border border-white/10 glass shadow-2xl shadow-black/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 dark:bg-black/20 border-b border-white/10">
                {columns.map((col) => (
                  <th key={col.key} onClick={() => col.sortable && handleSort(col.key)}
                    className={`text-left py-4 px-6 font-black text-[11px] uppercase tracking-[0.15em] text-foreground/70 transition-all ${col.sortable ? "cursor-pointer hover:text-foreground hover:bg-white/5 select-none" : ""}`}>
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && <div className="flex flex-col ml-0.5 opacity-50">
                        <ChevronUp className={`w-3 h-3 -mb-1 ${sort.key === col.key && sort.dir === "asc" ? "text-primary opacity-100" : ""}`} />
                        <ChevronDown className={`w-3 h-3 ${sort.key === col.key && sort.dir === "desc" ? "text-primary opacity-100" : ""}`} />
                      </div>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((c) => <td key={c.key} className="py-5 px-6"><div className="h-4 bg-white/5 rounded-full w-2/3" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-24">
                    <div className="flex flex-col items-center gap-2 opacity-60">
                      <Inbox className="w-12 h-12" />
                      <p className="font-semibold text-base">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginated.map((row, i) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      key={row._id || i} 
                      className="hover:bg-white/5 group transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="py-4 px-6 align-middle font-bold text-foreground transition-colors">
                          {col.render ? col.render(row) : row[col.key] ?? "—"}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && sorted.length > pageSize && (
          <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-black/20 border-t border-white/10 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white/10" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {paginationItems.map((item, i) =>
                item === PAGINATION_ELLIPSIS ? (
                  <span key={paginationItemKey(item, i)} className="px-2">…</span>
                ) : (
                  <Button key={paginationItemKey(item, i)} size="sm" variant={item === page ? "secondary" : "ghost"} className={`h-8 w-8 p-0 rounded-lg ${item === page ? "bg-primary text-primary-foreground" : "hover:bg-white/10"}`} onClick={() => setPage(item)}>{item}</Button>
                )
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white/10" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTableWrapper;
