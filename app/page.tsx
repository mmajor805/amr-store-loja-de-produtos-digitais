export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-3xl text-center">
        <span className="inline-block rounded-full bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
          NOVO SITE
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Sua loja digital em um só lugar
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Produtos digitais de alta qualidade, acesso rápido e uma experiência
          simples e profissional para seus clientes.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button className="rounded-xl bg-orange-500 px-8 py-4 font-semibold text-black transition hover:bg-orange-400">
            Ver produtos
          </button>

          <button className="rounded-xl border border-white/20 px-8 py-4 font-semibold transition hover:bg-white/10">
            Saiba mais
          </button>
        </div>
      </div>
    </main>
  );
}
