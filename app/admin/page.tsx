"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export const dynamic = "force-dynamic";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  active: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [purchaseUrl, setPurchaseUrl] = useState("");

  async function loadProducts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function clearForm() {
    setName("");
    setDescription("");
    setPrice("");
    setOldPrice("");
    setImageUrl("");
    setPurchaseUrl("");
    setEditingId(null);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setOldPrice(
      product.old_price !== null ? String(product.old_price) : ""
    );
    setImageUrl(product.image_url || "");
    setPurchaseUrl(product.purchase_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    const productData = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : null,
      image_url: imageUrl.trim() || null,
      purchase_url: purchaseUrl.trim() || null,
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        alert("Erro ao atualizar produto: " + error.message);
        setSaving(false);
        return;
      }

      alert("Produto atualizado com sucesso!");
    } else {
      const { error } = await supabase
        .from("products")
        .insert({
          ...productData,
          active: true,
        });

      if (error) {
        alert("Erro ao adicionar produto: " + error.message);
        setSaving(false);
        return;
      }

      alert("Produto adicionado com sucesso!");
    }

    clearForm();
    await loadProducts();

    setSaving(false);
  }

  async function toggleProduct(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        active: !product.active,
      })
      .eq("id", product.id);

    if (error) {
      alert("Erro ao alterar status: " + error.message);
      return;
    }

    await loadProducts();
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("Erro ao excluir produto: " + error.message);
      return;
    }

    if (editingId === product.id) {
      clearForm();
    }

    await loadProducts();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              AMR<span className="text-orange-500">.</span>STORE
            </h1>

            <p className="mt-1 text-gray-400">
              Painel administrativo
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Sair
          </button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId !== null
                  ? "Editar produto"
                  : "Adicionar produto"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {editingId !== null
                  ? "Altere as informações do produto."
                  : "Cadastre novos produtos sem precisar alterar o código do site."}
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={clearForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                Cancelar
              </button>
            )}
          </div>

          <form
            onSubmit={saveProduct}
            className="mt-6 grid gap-4"
          >

            <div>
              <label className="mb-2 block text-sm font-medium">
                Nome do produto
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Pack 500 Reels"
                required
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do produto"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Preço atual
                </label>

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="14.90"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Preço antigo
                </label>

                <input
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="29.90"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                URL da imagem
              </label>

              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Link de compra
              </label>

              <input
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {saving
                ? "Salvando..."
                : editingId !== null
                ? "SALVAR ALTERAÇÕES"
                : "+ ADICIONAR PRODUTO"}
            </button>

          </form>
        </section>

        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Produtos cadastrados
            </h2>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-gray-300">
              {products.length}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-400">
              Carregando produtos...
            </p>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400">
              Nenhum produto cadastrado ainda.
            </div>
          ) : (
            <div className="grid gap-4">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        )}

                        <div>
                          <h3 className="font-bold">
                            {product.name}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">

                            <span className="text-orange-400">
                              R$ {Number(product.price).toFixed(2)}
                            </span>

                            {product.old_price !== null && (
                              <span className="text-gray-500 line-through">
                                R$ {Number(product.old_price).toFixed(2)}
                              </span>
                            )}

                          </div>
                        </div>

                      </div>

                      {product.description && (
                        <p className="mt-3 line-clamp-2 text-sm text-gray-400">
                          {product.description}
                        </p>
                      )}

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          product.active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>

                      <button
                        onClick={() => editProduct(product)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => toggleProduct(product)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                      >
                        {product.active ? "Desativar" : "Ativar"}
                      </button>

                      <button
                        onClick={() => deleteProduct(product)}
                        className="rounded-xl border border-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Excluir
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
