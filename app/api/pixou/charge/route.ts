import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PIXOU_PAY_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          error: "PIXOU_PAY_SECRET_KEY não configurada na Vercel.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      external_id,
      amount,
      buyer,
      product,
    } = body;

    if (!external_id) {
      return NextResponse.json(
        {
          error: "external_id é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) < 600) {
      return NextResponse.json(
        {
          error: "O valor mínimo para pagamento é R$ 6,00.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.pixoupay.com/charge",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: String(external_id),
          payment_method: "pix",
          amount: Number(amount),

          buyer: buyer
            ? {
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone || undefined,
                document: buyer.document || undefined,
              }
            : undefined,

          product: product
            ? {
                name: product.name,
              }
            : undefined,

          postbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/pixou/webhook`,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Erro Pixou Pay:",
        result
      );

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "Não foi possível criar a cobrança Pix.",
          detail:
            result?.error?.detail || null,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Erro interno Pixou Pay:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno ao criar pagamento.",
      },
      { status: 500 }
    );
  }
}
