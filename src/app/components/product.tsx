import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ActionsCell, EditableCell } from "@/app/components/actions-cell";

export type Product = {
  codigo_sku: string;
  nombre: string;
  categoria_id: number;
  descripcion: string;
  precio_venta: number;
  stock_minimo: number;
  activo: boolean;
};

const columnHelper = createColumnHelper<Product>();
export const productColumns: ColumnDef<Product>[] = [
  columnHelper.accessor("codigo_sku", {
    header: "SKU",
  }),
  columnHelper.accessor("nombre", {
    header: "Name",
    cell: ({ row }) => <EditableCell row={row} field="nombre" />,
  }),
  columnHelper.accessor("categoria_id", {
    header: "Category",
    // cell: ({ row }) => (
    //   <EditableCell
    //     row={row}
    //     field="categoria_id"
    //     inputType="select"
    //     meta={{
    //       options: [
    //         { value: "1", label: "Alimentos" },
    //         { value: "2", label: "Accesorios" },
    //         { value: "3", label: "Medicamentos" },
    //       ],
    //     }}
    //     className="w-40"
    //   />
    // ),
  }),
  columnHelper.accessor("descripcion", {
    header: "Description",
    cell: ({ row }) => (
      <EditableCell
        row={row}
        field="descripcion"
        inputType="textarea"
        className="max-w-[400px]"
      />
    ),
  }),
  columnHelper.accessor("precio_venta", {
    header: "Price",
    cell: ({ row }) => (
      <EditableCell
        row={row}
        field="precio_venta"
        inputType="number"
        className="w-20"
      />
    ),
  }),
  columnHelper.accessor("stock_minimo", {
    header: "Stock",
    cell: ({ row }) => (
      <EditableCell
        row={row}
        field="stock_minimo"
        inputType="number"
        className="w-20"
      />
    ),
  }),
  columnHelper.accessor("activo", {
    header: "Active",
    cell: ({ row }) => (
      <EditableCell row={row} field="activo" inputType="checkbox" />
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        onRowSave={table.options.meta?.onRowSave}
        onRowDelete={table.options.meta?.onRowDelete}
      />
    ),
  }),
] as ColumnDef<Product>[];

export const useProducts = () => {
  const supabase = createClient();
  const [data, setData] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("productos")
        .select(
          "codigo_sku, nombre, categoria_id, descripcion, precio_venta, stock_minimo, activo"
        );

      if (!active) return;

      if (error) {
        setError(error.message);
      } else {
        setData(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [supabase]);

  const updateLocalProduct = (updated: Product) =>
    setData((prev) =>
      prev.map((p) =>
        p.codigo_sku === updated.codigo_sku ? updated : p
      )
    );

  const removeLocalProduct = (deleted: Product) =>
    setData((prev) =>
      prev.filter((p) => p.codigo_sku !== deleted.codigo_sku)
    );

  return { data, loading, error, updateLocalProduct, removeLocalProduct };
};

export function useProductActions() {
  const supabase = createClient();
  const router = useRouter();
  const saveProduct = async (product: Product) => {
    await supabase
      .from("productos")
      .update({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio_venta: product.precio_venta,
        stock_minimo: product.stock_minimo,
        activo: product.activo,
        categoria_id: product.categoria_id,
      })
      .eq("codigo_sku", product.codigo_sku);
    router.refresh();
  };
  const deleteProduct = async (product: Product) => {
    await supabase
      .from("productos")
      .delete()
      .eq("codigo_sku", product.codigo_sku);
    router.refresh();
  };
  return { saveProduct, deleteProduct };
}

/**
 * Creates a new product in Supabase.
 */
export const createProduct = async (product: Product) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("productos")
    .insert(product);
  if (error) {
    throw error;
  }
  return data;
};

export const getNextSku = async (): Promise<string> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("codigo_sku")
    .order("codigo_sku", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching last SKU: ${error.message}`);
  }

  const lastSku: string = data?.codigo_sku ?? "PROD000";

  const match = /^([A-Za-z]*)(\d+)$/.exec(lastSku);
  const prefix = match ? match[1] : "PROD";
  const numStr = match ? match[2] : "000";

  const nextNum = String(parseInt(numStr, 10) + 1).padStart(numStr.length, "0");
  return `${prefix}${nextNum}`;
};
