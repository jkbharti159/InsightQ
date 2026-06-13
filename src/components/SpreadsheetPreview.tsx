import React, { useState } from "react";
import { SpreadsheetTable } from "../types";
import { Search, Sheet, Table, Eye, Download } from "lucide-react";

interface SpreadsheetPreviewProps {
  tables: SpreadsheetTable[];
}

export default function SpreadsheetPreview({ tables }: SpreadsheetPreviewProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  if (!tables || tables.length === 0) return null;

  const activeTable = tables[activeTabIndex];
  const headers = activeTable.headers;
  const rawRows = activeTable.rows;

  // Filter rows by search query
  const filteredRows = rawRows.filter((row) =>
    headers.some((header) => {
      const val = row[header];
      return val !== undefined && String(val).toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  // Switch tabs and reset pagination
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div id="spreadsheet-preview-container" className="bg-zinc-900/40 border border-zinc-800 rounded-sm shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Header bar and controls */}
      <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 text-emerald-500 border border-zinc-800 rounded-sm">
            <Sheet className="w-5 h-5 animate-pulse" id="sheet-icon" />
          </div>
          <div>
            <h3 className="font-serif italic text-zinc-100 text-sm">Spreadsheet Tab Preview</h3>
            <p className="text-zinc-500 text-xs font-mono">
              PREVIEWING <span className="font-semibold text-zinc-350">{activeTable.sheetName}</span> ({rawRows.length} rows, {headers.length} columns)
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 w-full sm:w-64 text-xs bg-zinc-950 border border-zinc-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-200 placeholder-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Sheet Tabs selectors */}
      {tables.length > 1 && (
        <div className="px-6 py-2 bg-zinc-950/50 border-b border-zinc-800 flex flex-wrap gap-1.5">
          {tables.map((table, idx) => (
            <button
              key={`${table.sheetName}-${idx}`}
              id={`sheet-tab-btn-${idx}`}
              onClick={() => handleTabChange(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                activeTabIndex === idx
                  ? "bg-emerald-600 text-white font-mono text-[11px] shadow-sm"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200 font-mono text-[11px]"
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-500" />
              {table.sheetName}
            </button>
          ))}
        </div>
      )}

      {/* Spreadsheet grid table viewport */}
      <div className="flex-1 overflow-auto bg-zinc-950 relative">
        <table className="w-full text-left border-collapse min-w-max text-xs">
          <thead className="bg-zinc-900 text-zinc-300 uppercase tracking-wider text-[10px] sticky top-0 font-semibold border-b border-zinc-800 z-10 shadow-md">
            <tr>
              <th className="py-3 px-4 text-center text-zinc-500 w-12 border-r border-zinc-805 bg-zinc-90 w">#</th>
              {headers.map((header) => (
                <th key={header} className="py-3 px-4 font-semibold border-r border-zinc-800 bg-zinc-900 text-zinc-400 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-2 px-4 text-center font-mono text-zinc-500 border-r border-zinc-800 bg-zinc-900/40">
                    {startIndex + index + 1}
                  </td>
                  {headers.map((header) => {
                    const value = row[header];
                    const isNum = typeof value === "number";
                    return (
                      <td
                        key={header}
                        className={`py-2 px-4 border-r border-zinc-800/70 text-zinc-300 truncate max-w-xs ${
                          isNum ? "text-right font-mono text-emerald-400" : "font-sans text-zinc-300"
                        }`}
                      >
                        {value === null || value === undefined ? "" : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="py-12 text-center text-zinc-550 font-medium">
                  No matching data rows found. Try adjusting your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Bar / Pagination */}
      <div className="px-6 py-3 bg-zinc-900/60 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
        <div>
          Showing <span className="font-medium text-zinc-350">{Math.min(filteredRows.length, startIndex + 1)}-{Math.min(filteredRows.length, startIndex + pageSize)}</span> of{" "}
          <span className="font-medium text-zinc-350">{filteredRows.length}</span> entries
          {searchQuery && <span className="ml-1 text-emerald-400 font-mono">(filtered)</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-sm px-1.5 py-0.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-950 transition-all font-mono"
            >
              Prev
            </button>
            <span className="px-2 text-zinc-400">
              Page <span className="font-medium">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-950 transition-all font-mono"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
