/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInlineEdit } from "@/utils/provider/inlineEdit-provider";
import { Row } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FaSave } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

export type InputKind =
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "date";

type RendererProps<T, K extends keyof T> = {
  value: T[K];
  onChange: (v: T[K]) => void;
  meta?: Record<string, unknown>;
};

const inputRegistry: Record<
  InputKind,
  <T, K extends keyof T>(p: RendererProps<T, K>) => React.ReactElement
> = {
  text: ({ value, onChange }) => (
    <Input
      value={String(value)}
      onChange={(e) => onChange(e.target.value as any)}
    />
  ),
  number: ({ value, onChange }) => (
    <Input
      type="number"
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value) as any)}
    />
  ),
  checkbox: ({ value, onChange }) => (
    <input
      type="checkbox"
      checked={Boolean(value)}
      onChange={(e) => onChange(e.target.checked as any)}
    />
  ),
  select: ({ value, onChange, meta }) => (
    (() => {
      const options = (meta?.options as { value: unknown; label: string }[]) ?? [];
      const encode =
        (meta?.encode as ((v: unknown) => string) | undefined) ??
        ((v: unknown) => String(v as any));
      const decode =
        (meta?.decode as ((s: string) => unknown) | undefined) ??
        ((s: string) => s);
      const current = encode(value);
      return (
        <Select value={current} onValueChange={(v) => onChange(decode(v) as any)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={encode(opt.value)} value={encode(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    })()
  ),
  textarea: ({ value, onChange }) => (
    <Textarea
      className="border px-1 w-full"
      value={String(value)}
      onChange={(e) => onChange(e.target.value as any)}
    />
  ),
  date: ({ value, onChange }) => (
    <Input
      type="date"
      value={String(value)}
      onChange={(e) => onChange(e.target.value as any)}
    />
  ),
};

export function EditableCell<T, K extends keyof T>({
  row,
  field,
  inputType = "text",
  meta,
  className = "",
}: {
  row: Row<T>;
  field: K;
  inputType?: InputKind;
  meta?: Record<string, unknown>;
  className?: string;
}) {
  const { editingRowId, formData, updateField } = useInlineEdit<T>();
  const editing = editingRowId === row.id;

  if (!editing) {
    const rawValue = row.original[field] as unknown;
    const isDescription = (field as string) === "descripcion";
    const selectOptions = meta?.options as { value: unknown; label: string }[] | undefined;
    const encode =
      (meta?.encode as ((v: unknown) => string) | undefined) ??
      ((v: unknown) => String(v as any));
    const customFormat = meta?.format as ((v: unknown) => string) | undefined;

    let displayText: string;
    if (inputType === "select" && Array.isArray(selectOptions)) {
      const encoded = encode(rawValue as any);
      const match = selectOptions.find((o) => encode(o.value) === encoded);
      displayText = match ? match.label : String(rawValue as any);
    } else if (typeof customFormat === "function") {
      displayText = customFormat(rawValue);
    } else {
      displayText = String(rawValue as any);
    }

    return (
      <span
        className={
          isDescription
            ? "block max-w-[400px] md:break-words md:whitespace-normal truncate"
            : ""
        }
      >
        {displayText}
      </span>
    );
  }

  const Renderer = inputRegistry[
    inputType
  ] as (typeof inputRegistry)[InputKind];

  return (
    <div className={className}>
      <Renderer
        value={formData?.[field] as T[K]}
        onChange={(v) => updateField(field, v)}
        meta={meta}
      />
    </div>
  );
}
// ---------- End Generic EditableCell ----------

export function ActionsCell<T extends object>({
  row,
  onRowSave,
  onRowDelete,
}: {
  row: Row<T>;
  onRowSave?: (data: T) => Promise<void> | void;
  onRowDelete?: (data: T) => Promise<void> | void;
}) {
  const { editingRowId, formData, startEditing, cancelEditing } =
    useInlineEdit<T>();
  const editing = editingRowId === row.id;

  const canSave = typeof onRowSave === "function";
  const canDelete = typeof onRowDelete === "function";
  if (!canSave && !canDelete) {
    return null;
  }

  const handleSave = async () => {
    if (!formData || !onRowSave) return;
    await onRowSave(formData as T);
    cancelEditing();
  };
  const handleDelete = async () => {
    if (!onRowDelete) return;
    await onRowDelete(row.original);
  };

  if (editing) {
    return (
      <div className="flex gap-2">
        {canSave && (
          <button onClick={handleSave} className=" hover:underline text-sm">
            <FaSave className="hover:opacity-50" size={16} />
          </button>
        )}
        <button onClick={cancelEditing} className=" hover:underline text-sm">
          <ImCross className="hover:opacity-50" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      {canSave && (
        <button
          onClick={() => startEditing(row.original, row.id)}
          className="hover:underline"
        >
          <MdEdit size={16} className="hover:opacity-50" />
        </button>
      )}
      {canDelete && (
        <button onClick={handleDelete}>
          <FaTrash className="hover:opacity-50" />
        </button>
      )}
    </div>
  );
}
