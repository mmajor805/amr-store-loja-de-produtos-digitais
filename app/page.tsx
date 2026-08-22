"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../utils/supabase/client";
import { useCart } from "./context/CartContext";

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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const [showCartNotification, setShowCartNotification] =
    useState(false);
  const [addedProductName, setAddedProductName] =
    useState("");

  const { addToCart, cartCount } = useCart();

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
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        (product.category || "Outros") === selectedCategory;

      const searchableText = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchText === "" ||
        searchableText.includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  function handleAddToCart(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image_url: product.image_url,
    });

    setAddedProductName(product.name);
    setShowCartNotification(true);

    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* NOTIFICAÇÃO DO CARRINHO */}

      {showCartNotification && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 animate-[slideUp_0.3s_ease-out] sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:max-w-sm sm:translate-x-0">

          <div className="overflow-hidden rounded-2xl border border-orange-500/30 bg-[#111111]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">

            <div className="flex items-center gap-4 p-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xl shadow-lg shadow-orange-500/20">
                🛒
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <span className="text-sm font-black text-white">
                    Adicionado ao carrinho
                  </span>

                  <span className="text-green-400">
                    ✓
                  </span>

                </div>

                <p className="mt-1 truncate text-xs text-gray-400">
                  {addedProductName}
                </p>

              </div>

              <a
                href="/carrinho"
                className="shrink-0 rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-black transition hover:bg-orange-400"
              >
                Ver carrinho
              </a>

            </div>

            <div className="h-0.5 w-full bg-orange-500/20">
              <div className="h-full w-full origin-left animate-[progress_3s_linear] bg-orange-500" />
            </div>

          </div>

        </div>
      )}

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <a
            href="/"
            className="text-xl font-black"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </a>

          <div className="flex items-center gap-5">

            <span className="hidden text-sm text-gray-400 sm:block">
              Loja Digital
            </span>

            <a
              href="/carrinho"
              className="relative rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold transition hover:border-orange-500/40"
            >
              🛒 Carrinho

              {cartCount > 0 && (
                <span className="ml-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-black text-black">
                  {cartCount}
                </span>
              )}
            </a>

          </div>

        </div>

      </header>

      {/* HERO */}

      <section className="relative overflow-hidden px-5 pb-10 pt-14 sm:pb-14 sm:pt-20">

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
            Encontre produtos digitais, entretenimento, livros,
            ferramentas, cursos e muito mais.
          </p>

          {/* BUSCA */}

          <div className="mx-auto mt-8 max-w-2xl">

            <div className="relative">

              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O que você está procurando?"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-5 pl-14 pr-5 text-white outline-none transition placeholder:text-gray-500 focus:border-orange-500/60 focus:bg-white/[0.08]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}

            </div>

          </div>

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

          <div className="mb-8">

            <h2 className="text-2xl font-bold">
              {search.trim()
                ? `Resultados para "${search}"`
                : selectedCategory === "Todos"
                ? "Produtos em destaque"
                : selectedCategory}
            </h2>

            <p className="mt-2 text-gray-400">

              {filteredProducts.length}{" "}

              {filteredProducts.length === 1
                ? "produto encontrado"
                : "produtos encontrados"}

            </p>

          </div>

          {/* CARREGANDO */}

          {loading && (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">

              <p className="text-gray-400">
                Carregando produtos...
              </p>

            </div>

          )}

          {/* SEM RESULTADOS */}

          {!loading &&
            filteredProducts.length === 0 && (

              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">

                <div className="text-5xl">
                  🔎
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Nenhum produto encontrado
                </h3>

                <p className="mx-auto mt-2 max-w-md text-gray-500">
                  Tente pesquisar por outro termo ou selecione
                  outra categoria.
                </p>

              </div>

            )}

          {/* PRODUTOS */}

          {!loading &&
            filteredProducts.length > 0 && (

              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">

                {filteredProducts.map((product) => {

                  const price =
                    Number(product.price ?? 0);

                  const oldPrice =
                    product.old_price !== null
                      ? Number(product.old_price)
                      : null;

                  const discount =
                    oldPrice !== null &&
                    oldPrice > price
                      ? Math.round(
                          ((oldPrice - price) /
                            oldPrice) *
                            100
                        )
                      : null;

                  return (

                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 sm:rounded-3xl"
                    >

                      {/* IMAGEM */}

                      <a
                        href={`/produto/${product.id}`}
                        className="block overflow-hidden"
                      >

                        {product.image_url ? (

                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52"
                          />

                        ) : (

                          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black sm:h-52">

                            <div className="text-center">

                              <div className="text-3xl font-black sm:text-5xl">
                                AMR
                              </div>

                              <div className="mt-1 text-[8px] uppercase tracking-[0.18em] text-orange-400 sm:mt-2 sm:text-xs sm:tracking-[0.25em]">
                                {product.category ||
                                  "Produto Digital"}
                              </div>

                            </div>

                          </div>

                        )}

                      </a>

                      {/* INFORMAÇÕES */}

                      <div className="p-3 sm:p-6">

                        <div className="flex items-center justify-between gap-1">

                          <span className="max-w-[75%] truncate rounded-full bg-orange-500/10 px-2 py-1 text-[9px] font-bold text-orange-400 sm:px-3 sm:text-xs">
                            {product.category ||
                              "Outros"}
                          </span>

                          {discount !== null && (
                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-[9px] font-bold text-green-400 sm:px-3 sm:text-xs">
                              -{discount}%
                            </span>
                          )}

                        </div>

                        <h3 className="mt-3 line-clamp-2 text-sm font-bold sm:mt-5 sm:text-xl">
                          {product.name}
                        </h3>

                        {product.description && (

                          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-gray-400 sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
                            {product.description}
                          </p>

                        )}

                        {/* PREÇO */}

                        <div className="mt-3 sm:mt-6">

                          {oldPrice !== null &&
                            oldPrice > price && (

                              <div className="text-[10px] text-gray-500 line-through sm:text-sm">
                                R${" "}
                                {oldPrice
                                  .toFixed(2)
                                  .replace(
                                    ".",
                                    ","
                                  )}
                              </div>

                            )}

                          <div className="mt-1 text-xl font-black sm:text-3xl">
                            R${" "}
                            {price
                              .toFixed(2)
                              .replace(
                                ".",
                                ","
                              )}
                          </div>

                        </div>

                        {/* BOTÕES */}

                        <div className="mt-3 grid gap-2 sm:mt-6 sm:gap-3">

                          <button
                            onClick={() =>
                              handleAddToCart(product)
                            }
                            className="w-full rounded-lg border border-orange-500 bg-orange-500/10 px-2 py-2.5 text-[9px] font-black leading-tight text-orange-400 transition hover:bg-orange-500 hover:text-black sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
                          >
                            🛒 ADICIONAR AO CARRINHO
                          </button>

                          <a
                            href={`/produto/${product.id}`}
                            className="w-full rounded-lg bg-orange-500 px-2 py-2.5 text-center text-[9px] font-black leading-tight text-black transition hover:bg-orange-400 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
                          >
                            VER PRODUTO
                          </a>

                        </div>

                      </div>

                    </article>

                  );

                })}

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

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>

    </main>
  );
}
