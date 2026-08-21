import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const secretKey = process.env.PIXOU_PAY_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "PIXOU_PAY_SECRET_KEY não configurada na Vercel.",
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
    const numericAmount = Number(amount);
    if (
      !Number.isInteger(numericAmount) ||
      numericAmount < 600
    ) {
      return NextResponse.json(
        {
          error:
            "O valor mínimo para pagamento via Pix é R$ 6,00.",
        },
        { status: 400 }
      );
    }
    if (numericAmount > 300000) {
      return NextResponse.json(
        {
          error:
            "O valor máximo para pagamento via Pix é R$ 3.000,00.",
        },
        { status: 400 }
      );
    }
    const payload: Record<string, unknown> = {
      external_id: String(external_id),
      payment_method: "pix",
      amount: numericAmount,
    };
    if (buyer) {
      payload.buyer = {
        name: String(buyer.name || "").trim(),
        email: String(buyer.email || "").trim(),
        phone: buyer.phone
          ? String(buyer.phone).replace(/\D/g, "")
          : undefined,
        document: buyer.document
          ? String(buyer.document).replace(/\D/g, "")
          : undefined,
      };
    }
    if (product?.name) {
      payload.product = {
        name: String(product.name),
      };
    }
    if (siteUrl) {
      payload.postbackUrl =
        `${siteUrl.replace(/\/$/, "")}/api/pixou/webhook`;
    }
    const response = await fetch(
      "https://api.pixoupay.com/charge",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error(
        "Erro retornado pela Pixou Pay:",
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
      "Erro interno na integração Pixou Pay:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Erro interno ao criar o pagamento Pix.",
      },
      { status: 500 }
    );
  }
}
