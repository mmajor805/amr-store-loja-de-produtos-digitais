"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../utils/supabase/client";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  category: string | null;
  active: boolean;
};

const categories = [
  "Todos",
  "Streaming",
  "Filmes",
  "Livros",
  "Design",
  "Cursos",
  "Redes Sociais",
  "Música",
  "Packs Digitais",
  "Outros",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, description, price, old_price, image_url, purchase_url, category, active"
          )
          .eq("active", true)
          .order("id", { ascending: false });

        if (error) {
          console.error("Erro ao carregar produtos:", error);
          setProducts([]);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Erro inesperado:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") {
      return products;
    }

    return products.filter(
      (product) =>
        (product.category || "Outros") === selectedCategory
    );
  }, [products, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <a
            href="/"
            className="text-xl font-black"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </a>

          <span className="text-sm text-gray-400">
            Loja Digital
          </span>

        </div>

      </header>

      {/* HERO */}

      <section className="relative overflow-hidden px-5 pb-14 pt-16 sm:pb-20 sm:pt-20">

        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">

          <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
            AMR.STORE
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Tudo o que você procura
            <span className="block text-orange-500">
              em um só lugar.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Encontre produtos digitais, entretenimento, livros, ferramentas,
            cursos e muito mais.
          </p>

        </div>

      </section>

      {/* CATEGORIAS */}

      <section className="px-5 pb-10">

        <div className="mx-auto max-w-6xl">

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              Categorias
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Encontre rapidamente o que procura.
            </p>

          </div>

          <div className="flex gap-3 overflow-x-auto pb-3">

            {categories.map((category) => {

              const selected =
                selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`whitespace-nowrap rounded-full border px-5 py-3 text-sm font-bold transition ${
                    selected
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-orange-500/40 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );

            })}

          </div>

        </div>

      </section>

      {/* PRODUTOS */}

      <section className="px-5 pb-20">

        <div className="mx-auto max-w-6xl">

          <div className="mb-8 flex items-end justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold">
                {selectedCategory === "Todos"
                  ? "Produtos em destaque"
                  : selectedCategory}
              </h2>

              <p className="mt-2 text-gray-400">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "produto disponível"
                  : "produtos disponíveis"}
              </p>

            </div>

          </div>

          {/* CARREGANDO */}

          {loading && (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">

              <p className="text-gray-400">
                Carregando produtos...
              </p>

            </div>

          )}

          {/* SEM PRODUTOS */}

          {!loading &&
            filteredProducts.length === 0 && (

              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">

                <div className="text-4xl">
                  📦
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  Nenhum produto encontrado
                </h3>

                <p className="mt-2 text-gray-500">
                  Ainda não temos produtos disponíveis nesta categoria.
                </p>

                {selectedCategory !== "Todos" && (

                  <button
                    onClick={() =>
                      setSelectedCategory("Todos")
                    }
                    className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black"
                  >
                    VER TODOS OS PRODUTOS
                  </button>

                )}

              </div>

            )}

          {/* PRODUTOS */}

          {!loading &&
            filteredProducts.length > 0 && (

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {filteredProducts.map((product) => (

                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-orange-500/40"
                  >

                    {/* IMAGEM */}

                    <a
                      href={`/produto/${product.id}`}
                      className="block"
                    >

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-52 items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black">

                          <div className="text-center">

                            <div className="text-5xl font-black">
                              AMR
                            </div>

                            <div className="mt-2 text-xs uppercase tracking-[0.25em] text-orange-400">
                              {product.category || "Produto Digital"}
                            </div>

                          </div>

                        </div>

                      )}

                    </a>

                    {/* INFORMAÇÕES */}

                    <div className="p-6">

                      <div className="flex items-center justify-between gap-3">

                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                          {product.category || "Outros"}
                        </span>

                      </div>

                      <h3 className="mt-5 text-xl font-bold">
                        {product.name}
                      </h3>

                      {product.description && (

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
                          {product.description}
                        </p>

                      )}

                      {/* PREÇO */}

                      <div className="mt-6">

                        {product.old_price !== null &&
                          Number(product.old_price) >
                            Number(product.price ?? 0) && (

                            <div className="text-sm text-gray-500 line-through">
                              R${" "}
                              {Number(product.old_price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </div>

                          )}

                        <div className="mt-1 text-3xl font-black">
                          R${" "}
                          {Number(product.price ?? 0)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>

                      </div>

                      {/* BOTÃO */}

                      <a
                        href={`/produto/${product.id}`}
                        className="mt-6 block w-full rounded-xl bg-orange-500 px-5 py-4 text-center font-black text-black transition hover:bg-orange-400"
                      >
                        VER PRODUTO
                      </a>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </div>

      </section>

      {/* BENEFÍCIOS */}

      <section className="border-y border-white/10 bg-white/[0.02] px-5 py-16">

        <div className="mx-auto max-w-5xl">

          <div className="grid gap-6 sm:grid-cols-3">

            <div className="text-center">

              <div className="text-3xl">
                🔒
              </div>

              <h3 className="mt-3 font-bold">
                Compra segura
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Processo simples e seguro.
              </p>

            </div>

            <div className="text-center">

              <div className="text-3xl">
                ⚡
              </div>

              <h3 className="mt-3 font-bold">
                Acesso digital
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Produtos digitais de forma prática.
              </p>

            </div>

            <div className="text-center">

              <div className="text-3xl">
                💎
              </div>

              <h3 className="mt-3 font-bold">
                Produtos selecionados
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Conteúdos para diferentes necessidades.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">

        © 2026 AMR.STORE — Todos os direitos reservados.

      </footer>

    </main>
  );
}
