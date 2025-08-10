"use client";
import type { RowData } from "@tanstack/react-table";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";


declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onRowSave?: (row: TData) => Promise<void> | void;
    onRowDelete?: (row: TData) => Promise<void> | void;
    categories?: { id: number; nombre: string }[];
    searchTextExtractor?: (row: TData) => string;
  }
}
import React, { useState, useMemo, SetStateAction } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { InlineEditProvider } from "@/utils/provider/inlineEdit-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InputKind } from "./actions-cell";
import { toast } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/sonner";

interface TankTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  onRowSave?: (row: TData) => Promise<void> | void;
  onRowDelete?: (row: TData) => Promise<void> | void;
  showPagination?: boolean;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  showAdd?: boolean;
  onAdd?: () => void;
  addButtonLabel?: string;
  tableMeta?: Partial<import("@tanstack/react-table").TableMeta<TData>>;
  createForm?: {
    title?: string;
    submitLabel?: string;
    cancelLabel?: string;
    getInitialValues?: () => Promise<Partial<TData>> | Partial<TData>;
    onSubmit: (data: TData) => Promise<void> | void;
    successMessage?: string | ((data: TData) => string);
    fields: Array<{
      name: keyof TData & string;
      label: string;
      inputType: InputKind;
      required?: boolean;
      placeholder?: string;
      className?: string;
      readOnly?: boolean;
      step?: string;
      options?: { value: unknown; label: string }[];
      encode?: (v: unknown) => string;
      decode?: (s: string) => unknown;
      parse?: (raw: string | boolean) => unknown;
    }>;
  };
  deleteConfirm?: {
    title?: string;
    description?: string | ((row: TData | null) => string);
    confirmLabel?: string;
    cancelLabel?: string;
    successMessage?: string | ((row: TData) => string);
  };
  updateSuccessMessage?: string | ((row: TData) => string);
}

const TankTable = <TData extends object>({
  data,
  columns,
  onRowSave,
  onRowDelete,
  showPagination = false,
  pageSizeOptions = [10, 50, 100],
  initialPageSize = 10,
  showAdd = false,
  onAdd,
  addButtonLabel = "Add",
  tableMeta,
  createForm,
  deleteConfirm,
  updateSuccessMessage,
}: TankTableProps<TData>) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [openDelete, setOpenDelete] = useState(false);
  const [rowPendingDelete, setRowPendingDelete] = useState<TData | null>(null);
  const filteredData = useMemo(() => {
    const extractor = tableMeta?.searchTextExtractor as
      | ((row: TData) => string)
      | undefined;
    const term = globalFilter.toLowerCase();
    if (!term) return data;
    return data.filter((item) => {
      const base = extractor
        ? extractor(item)
        : Object.values(item)
            .map((v) => String(v))
            .join(" ");
      return base.toLowerCase().includes(term);
    });
  }, [data, globalFilter, tableMeta?.searchTextExtractor]);
  const requestDelete = (row: TData) => {
    if (deleteConfirm) {
      setRowPendingDelete(row);
      setOpenDelete(true);
      return;
    }
    onRowDelete?.(row);
  };

  const requestSave = async (row: TData) => {
    await onRowSave?.(row);
    const msg =
      typeof updateSuccessMessage === "function"
        ? updateSuccessMessage(row)
        : updateSuccessMessage ?? "Actualizado exitosamente";
    toast.success(msg);
  };

  const table = useReactTable<TData>({
    data: filteredData,
    columns,
    state: { pagination, sorting },
    meta: { onRowSave: requestSave, onRowDelete: requestDelete, ...(tableMeta ?? {}) },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleOpenCreate = async () => {
    if (!createForm) {
      onAdd?.();
      return;
    }
    try {
      setInitialLoading(true);
      const base = createForm.getInitialValues
        ? await createForm.getInitialValues()
        : {};
      setFormValues({ ...(base as Record<string, unknown>) });
    } finally {
      setInitialLoading(false);
      setOpenCreate(true);
    }
  };

  const setFieldValue = (name: string, value: unknown) =>
    setFormValues((prev) => ({ ...prev, [name]: value }));

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm) return;
    const payload: Record<string, unknown> = {};
    for (const f of createForm.fields) {
      const raw = formValues[f.name];
      let val: unknown = raw;
      if (typeof f.parse === "function") {
        val = f.parse(raw as string | boolean);
      } else {
        switch (f.inputType) {
          case "number":
            val = raw === "" || raw === undefined ? null : Number(raw);
            break;
          case "checkbox":
            val = Boolean(raw);
            break;
          case "select":
          case "text":
          case "textarea":
          case "date":
          default:
            val = raw as string;
        }
      }
      payload[f.name] = val;
    }
    const typed = payload as TData;
    await createForm.onSubmit(typed);
    const createMsg =
      typeof createForm.successMessage === "function"
        ? createForm.successMessage(typed)
        : createForm.successMessage ?? "Creado exitosamente";
    toast.success(createMsg);
    setOpenCreate(false);
  };

  return (
    <InlineEditProvider>
      <Toaster richColors position="top-right" />
      <div className="flex gap-4">
        <div className="flex justify-end mb-2">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setGlobalFilter(e.target.value)
            }
            className="w-64"
          />
        </div>
        <div className="flex justify-between items-center mb-2">
          <div />
          <div className="flex gap-2">
            {showAdd && (
              <Button size="sm" variant="outline" onClick={handleOpenCreate}>
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Table className="w-full">
          <TableHeader className="bg-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : (
                      <span
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <div className="mx-1"><FaChevronUp /></div>,
                          desc: <div className="mx-1"><FaChevronDown /></div>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-gray-100">
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
        {showPagination && (
          <div className="flex justify-end items-center gap-2 mt-2">
            <label className="text-sm flex items-center gap-2">
              Rows
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value: string) => {
                  setPagination({ pageIndex: 0, pageSize: Number(value) });
                }}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((sz) => (
                    <SelectItem key={sz} value={String(sz)}>
                      {sz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {createForm && (
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{createForm.title ?? "Create"}</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={submitCreate}>
              {createForm.fields.map((f) => {
                const value = formValues[f.name];
                const common = { id: f.name, name: f.name, required: f.required } as const;
                switch (f.inputType) {
                  case "textarea":
                    return (
                      <div className="space-y-2" key={f.name}>
                        <Label htmlFor={f.name}>{f.label}</Label>
                        <Textarea
                          {...common}
                          rows={3}
                          value={String(value ?? "")}
                          placeholder={f.placeholder}
                          className={f.className}
                          onChange={(e) => setFieldValue(f.name, e.target.value)}
                        />
                      </div>
                    );
                  case "number":
                    return (
                      <div className="space-y-2" key={f.name}>
                        <Label htmlFor={f.name}>{f.label}</Label>
                        <Input
                          type="number"
                          step={f.step}
                          {...common}
                          value={String(value ?? "")}
                          placeholder={f.placeholder}
                          className={f.className}
                          onChange={(e) => setFieldValue(f.name, e.target.value)}
                        />
                      </div>
                    );
                  case "checkbox":
                    return (
                      <div className="flex items-center space-x-2" key={f.name}>
                        <Checkbox
                          id={f.name}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => setFieldValue(f.name, !!checked)}
                        />
                        <Label htmlFor={f.name}>{f.label}</Label>
                      </div>
                    );
                  case "select":
                    return (
                      <div className="space-y-2" key={f.name}>
                        <Label htmlFor={f.name}>{f.label}</Label>
                        <Select
                          value={(f.encode?.(value as unknown) ?? String(value ?? ""))}
                          onValueChange={(val) =>
                            setFieldValue(
                              f.name,
                              (f.decode ? f.decode(val) : val) as unknown
                            )
                          }
                        >
                          <SelectTrigger id={f.name}>
                            <SelectValue placeholder={f.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {(f.options ?? []).map((opt) => (
                              <SelectItem
                                key={(f.encode ? f.encode(opt.value) : String(opt.value))}
                                value={(f.encode ? f.encode(opt.value) : String(opt.value))}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  case "date":
                  case "text":
                  default:
                    return (
                      <div className="space-y-2" key={f.name}>
                        <Label htmlFor={f.name}>{f.label}</Label>
                        <Input
                          type={f.inputType === "date" ? "date" : "text"}
                          {...common}
                          readOnly={f.readOnly}
                          value={String(value ?? "")}
                          placeholder={f.placeholder}
                          className={f.className}
                          onChange={(e) => setFieldValue(f.name, e.target.value)}
                        />
                      </div>
                    );
                }
              })}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                  {createForm.cancelLabel ?? "Cancel"}
                </Button>
                <Button type="submit" disabled={initialLoading}>
                  {createForm.submitLabel ?? "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteConfirm && (
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{deleteConfirm.title ?? "Confirm delete"}</DialogTitle>
            </DialogHeader>

            <div className="text-sm text-muted-foreground">
              {(() => {
                const fallback =
                  "Are you sure you want to delete this item? This action cannot be undone.";
                if (!deleteConfirm.description) return fallback;
                if (typeof deleteConfirm.description === "function") {
                  try {
                    return deleteConfirm.description(rowPendingDelete);
                  } catch {
                    return fallback;
                  }
                }
                return deleteConfirm.description;
              })()}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDelete(false)}
              >
                {deleteConfirm.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (rowPendingDelete && onRowDelete) {
                    await onRowDelete(rowPendingDelete);
                    const delMsg =
                      typeof deleteConfirm.successMessage === "function"
                        ? deleteConfirm.successMessage(rowPendingDelete)
                        : deleteConfirm.successMessage ?? "Eliminado exitosamente";
                    toast.success(delMsg);
                  }
                  setOpenDelete(false);
                  setRowPendingDelete(null);
                }}
              >
                {deleteConfirm.confirmLabel ?? "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </InlineEditProvider>
  );
};

export default TankTable;
