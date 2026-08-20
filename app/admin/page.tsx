"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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

    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : null,
      image_url: imageUrl || null,
      purchase_url: purchaseUrl || null,
      active: true,
    });

    if (error) {
      alert("Erro ao adicionar produto: " + error.message);
      setSaving(false);
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    setOldPrice("");
    setImageUrl("");
    setPurchaseUrl("");

    await loadProducts();

    setSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
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
            className="rounded-xl border border-white/10 px-4 py-2 text-sm"
          >
            Sair
          </button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-bold">
            Adicionar produto
          </h2>

          <form onSubmit={addProduct} className="mt-6 grid gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
              required
              className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto"
              rows={4}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Preço atual"
                type="number"
                step="0.01"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />

              <input
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="Preço antigo"
                type="number"
                step="0.01"
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL da imagem"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
            />

            <input
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              placeholder="Link de compra"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-4 font-bold text-black disabled:opacity-50"
            >
              {saving ? "Salvando..." : "+ ADICIONAR PRODUTO"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">
            Produtos cadastrados
          </h2>

          {loading ? (
            <p className="text-gray-400">Carregando...</p>
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
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        R$ {Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      Ativo
                    </span>
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
