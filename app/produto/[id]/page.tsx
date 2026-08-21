"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/client";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  active: boolean;
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();

      if (error) {
        console.error(error);
        setError("Produto não encontrado.");
      } else {
        setProduct(data);
      }

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p className="text-gray-400">
          Carregando produto...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <div className="text-center">

          <h1 className="text-3xl font-black">
            Produto não encontrado
          </h1>

          <p className="mt-3 text-gray-400">
            Esse produto pode ter sido removido ou desativado.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-4 font-bold text-black"
          >
            VOLTAR PARA A LOJA
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <Link
            href="/"
            className="text-xl font-bold"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar para a loja
          </Link>

        </div>
      </header>

      <section className="px-5 py-12 sm:py-20">

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

            {product.image_url ? (

              <img
                src={product.image_url}
                alt={product.name}
                className="h-[350px] w-full object-cover sm:h-[500px]"
              />

            ) : (

              <div className="flex h-[350px] items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black sm:h-[500px]">

                <div className="text-center">

                  <div className="text-6xl font-black">
                    AMR
                  </div>

                  <div className="mt-2 text-sm uppercase tracking-[0.3em] text-orange-400">
                    Produto Digital
                  </div>

                </div>

              </div>

            )}

          </div>

          <div>

            <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
              OFERTA ESPECIAL
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              {product.name}
            </h1>

            {product.description && (

              <p className="mt-6 text-base leading-7 text-gray-400 sm:text-lg">
                {product.description}
              </p>

            )}

            <div className="mt-8">

              {product.old_price !== null && (

                <div className="text-lg text-gray-500 line-through">
                  R${" "}
                  {Number(product.old_price)
                    .toFixed(2)
                    .replace(".", ",")}
                </div>

              )}

              <div className="mt-1 text-5xl font-black">
                R${" "}
                {Number(product.price ?? 0)
                  .toFixed(2)
                  .replace(".", ",")}
              </div>

            </div>

            {product.purchase_url ? (

              <a
                href={product.purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-2xl bg-orange-500 px-6 py-5 text-center text-lg font-black text-black transition hover:bg-orange-400"
              >
                QUERO COMPRAR AGORA
              </a>

            ) : (

              <button
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-2xl bg-white/10 px-6 py-5 text-lg font-black text-gray-500"
              >
                COMPRA EM BREVE
              </button>

            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm text-gray-400">
                🔒 Compra segura
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Após a compra, você receberá as instruções para acessar seu produto digital.
              </p>

            </div>

          </div>

        </div>

      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>

    </main>
  );
}
