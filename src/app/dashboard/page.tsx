"use client";
import React from "react";
import {
  productColumns,
  useProducts,
  createProduct,
  getNextSku,
  type Product,
} from "@/utils/models/product";
import { useProductActions } from "@/utils/models/product";
import TankTable from "../components/tank-table";
// Removed dialog-specific imports; creation is now handled generically by TankTable

const DashBoardPage = () => {
  const {
    data,
    categories,
    loading,
    error,
    updateLocalProduct,
    removeLocalProduct,
  } = useProducts();
  const { saveProduct, deleteProduct } = useProductActions();

  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {error && <p className="text-red-600 mb-4">Error: {error}</p>}
      {loading ? (
        <p>Cargando productos…</p>
      ) : (
        <>
          <TankTable
            data={data}
            columns={productColumns}
            onRowSave={async (row) => {
              await saveProduct(row);
              updateLocalProduct(row);
            }}
            onRowDelete={async (row) => {
              await deleteProduct(row);
              removeLocalProduct(row);
            }}
            showPagination={true}
            pageSizeOptions={[5, 10, 20]}
            initialPageSize={10}
            showAdd={true}
            addButtonLabel="Add"
            tableMeta={{
              categories: categories?.map((c) => ({
                id: c.id,
                nombre: c.nombre,
              })),
              searchTextExtractor: (row: Product) => {
                const catName =
                  categories?.find((c) => c.id === row.categoria_id)?.nombre ??
                  "";
                return [
                  row.codigo_sku,
                  row.nombre,
                  catName,
                  row.descripcion,
                  String(row.precio_venta),
                  String(row.stock_minimo),
                  String(row.activo),
                ]
                  .filter((v) => v !== undefined && v !== null)
                  .join(" ");
              },
            }}
            createForm={{
              title: "Add Product",
              submitLabel: "Save",
              cancelLabel: "Cancel",
              successMessage: "Producto guardado correctamente",
              getInitialValues: async () => ({
                codigo_sku: await getNextSku(),
                activo: false,
              }),
              onSubmit: async (payload: Product) => {
                const insertedRows = await createProduct(payload);
                const inserted = Array.isArray(insertedRows)
                  ? insertedRows[0]
                  : payload;
                updateLocalProduct(inserted);
              },
              fields: [
                {
                  name: "codigo_sku",
                  label: "Código SKU",
                  inputType: "text",
                  required: true,
                  readOnly: true,
                },
                {
                  name: "nombre",
                  label: "Nombre",
                  inputType: "text",
                  required: true,
                },
                {
                  name: "categoria_id",
                  label: "Categoría",
                  inputType: "select",
                  required: true,
                  options: categories.map((c) => ({
                    value: c.id,
                    label: c.nombre,
                  })),
                  encode: (v: unknown) => String(v as number),
                  decode: (s: string) => parseInt(s, 10),
                },
                {
                  name: "descripcion",
                  label: "Descripción",
                  inputType: "textarea",
                  required: true,
                },
                {
                  name: "precio_venta",
                  label: "Precio Venta",
                  inputType: "number",
                  required: true,
                  step: "0.01",
                },
                {
                  name: "stock_minimo",
                  label: "Stock Mínimo",
                  inputType: "number",
                  required: true,
                },
                { name: "activo", label: "Activo", inputType: "checkbox" },
              ],
            }}
            deleteConfirm={{
              title: "Eliminar producto",
              description: (row) =>
                row
                  ? `¿Seguro que deseas eliminar el producto ${(row as Product).nombre}?`
                  : "¿Seguro que deseas eliminar este producto?",
              confirmLabel: "Eliminar",
              cancelLabel: "Cancelar",
            }}
          />
        </>
      )}
    </div>
  );
};

export default DashBoardPage;
