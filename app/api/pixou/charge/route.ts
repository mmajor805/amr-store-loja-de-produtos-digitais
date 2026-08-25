import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PIXOU_PAY_SECRET_KEY;

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

    const externalId = String(
      body?.external_id || ""
    ).trim();

    const amount = Number(body?.amount);

    // =========================
    // VALIDAÇÕES
    // =========================

    if (!externalId) {
      return NextResponse.json(
        {
          error: "ID do pedido não informado.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        {
          error: "Valor do pagamento inválido.",
          received: body?.amount,
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount)) {
      return NextResponse.json(
        {
          error:
            "O valor deve ser enviado em centavos como número inteiro.",
          received: amount,
        },
        { status: 400 }
      );
    }

    if (amount < 600) {
      return NextResponse.json(
        {
          error:
            "O valor mínimo para pagamento via Pix é R$ 6,00.",
          received: amount,
        },
        { status: 400 }
      );
    }

    if (amount > 300000) {
      return NextResponse.json(
        {
          error:
            "O valor máximo para pagamento via Pix é R$ 3.000,00.",
          received: amount,
        },
        { status: 400 }
      );
    }

    // =========================
    // PAYLOAD MÍNIMO
    // =========================

    const payload = {
      external_id: externalId,
      payment_method: "pix",
      amount: amount,
    };

    console.log(
      "PIXOU - PAYLOAD:",
      JSON.stringify(payload)
    );

    // =========================
    // REQUISIÇÃO
    // =========================

    const response = await fetch(
      "https://api.pixoupay.com/charge",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),

        cache: "no-store",
      }
    );

    // =========================
    // RESPOSTA
    // =========================

    const responseText =
      await response.text();

    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        raw: responseText,
      };
    }

    console.log(
      "PIXOU - STATUS:",
      response.status
    );

    console.log(
      "PIXOU - RESPONSE:",
      JSON.stringify(result)
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            result?.message ||
            "A Pixou recusou a cobrança.",

          detail:
            result?.error?.detail ||
            result?.detail ||
            result?.errors ||
            null,

          response: result,
        },
        {
          status: response.status,
        }
      );
    }

    // =========================
    // SUCESSO
    // =========================

    return NextResponse.json(result);

  } catch (error) {
    console.error(
      "PIXOU - ERRO INTERNO:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao criar pagamento.",
      },
      {
        status: 500,
      }
    );
  }
}
