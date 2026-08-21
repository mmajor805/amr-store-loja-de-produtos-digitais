"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  category: string | null;
  active: boolean;
};

const categories = [
  "Redes Sociais",
  "Streaming",
  "Filmes",
  "Livros",
  "Design",
  "Cursos",
  "Música",
  "Packs Digitais",
  "Outros",
];

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
  const [category, setCategory] = useState("Outros");

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

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Digite o nome do produto.");
      return;
    }

    if (!price) {
      alert("Digite o preço do produto.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : null,
      image_url: imageUrl.trim() || null,
      purchase_url: purchaseUrl.trim() || null,
      category,
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
    setCategory("Outros");

    await loadProducts();

    setSaving(false);

    alert("Produto adicionado com sucesso!");
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

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

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
            className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Sair
          </button>

        </header>

        {/* CADASTRO */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="text-2xl font-bold">
            Adicionar produto
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Cadastre produtos digitais de diferentes categorias.
          </p>

          <form
            onSubmit={addProduct}
            className="mt-6 grid gap-4"
          >

            {/* NOME */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Nome do produto
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: E-book Marketing Digital"
                required
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* CATEGORIA */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Categoria
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              >

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-black"
                  >
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* DESCRIÇÃO */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o produto"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"
              />

            </div>

            {/* PREÇOS */}

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

            {/* IMAGEM */}

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

            {/* COMPRA */}

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

            {/* BOTÃO */}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {saving
                ? "Salvando..."
                : "+ ADICIONAR PRODUTO"}
            </button>

          </form>

        </section>

        {/* PRODUTOS */}

        <section className="mt-8">

          <h2 className="mb-4 text-2xl font-bold">
            Produtos cadastrados
          </h2>

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

                    <div>

                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                          {product.category || "Outros"}
                        </span>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                          R$ {Number(product.price).toFixed(2).replace(".", ",")}
                        </span>

                      </div>

                    </div>

                    <button
                      onClick={() => toggleProduct(product)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                        product.active
                          ? "bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400"
                          : "bg-red-500/10 text-red-400 hover:bg-green-500/10 hover:text-green-400"
                      }`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </button>

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
