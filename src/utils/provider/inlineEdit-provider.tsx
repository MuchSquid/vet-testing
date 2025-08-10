/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from "react";

type InlineEditState<T> = {
  editingRowId: string | null;
  formData: T | null;
  startEditing: (row: T, id: string) => void;
  cancelEditing: () => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
};

const InlineEditContext = createContext<InlineEditState<any> | null>(null);

export const useInlineEdit = <T,>() =>
  useContext(InlineEditContext) as InlineEditState<T>;

export const InlineEditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any | null>(null);

  const startEditing = (row: any, id: string) => {
    setEditingRowId(id);
    setFormData({ ...row });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setFormData(null);
  };

  const updateField = <K extends keyof any>(field: K, value: any[K]) =>
    setFormData((prev: any) => (prev ? { ...prev, [field]: value } : prev));

  return (
    <InlineEditContext.Provider
      value={{
        editingRowId,
        formData,
        startEditing,
        cancelEditing,
        updateField,
      }}
    >
      {children}
    </InlineEditContext.Provider>
  );
};