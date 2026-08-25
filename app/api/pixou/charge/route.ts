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

    // =========================
    // VALIDAR ID
    // =========================

    if (!external_id) {
      return NextResponse.json(
        {
          error: "external_id é obrigatório.",
        },
        { status: 400 }
      );
    }

    // =========================
    // VALIDAR VALOR
    // =========================

    const numericAmount = Number(amount);

    if (
      !Number.isInteger(numericAmount) ||
      numericAmount < 600
    ) {
      return NextResponse.json(
        {
          error:
            "O valor mínimo para pagamento via Pix é R$ 6,00.",
          received_amount: amount,
        },
        { status: 400 }
      );
    }

    if (numericAmount > 300000) {
      return NextResponse.json(
        {
          error:
            "O valor máximo para pagamento via Pix é R$ 3.000,00.",
          received_amount: amount,
        },
        { status: 400 }
      );
    }

    // =========================
    // PREPARAR PAYLOAD
    // =========================

    const payload: Record<string, unknown> = {
      external_id: String(external_id),
      payment_method: "pix",
      amount: numericAmount,
    };

    // =========================
    // DADOS DO COMPRADOR
    // =========================

    if (buyer) {
      const buyerName = String(
        buyer.name || ""
      ).trim();

      const buyerEmail = String(
        buyer.email || ""
      ).trim();

      const buyerPhone = buyer.phone
        ? String(buyer.phone).replace(/\D/g, "")
        : "";

      const buyerDocument = buyer.document
        ? String(buyer.document).replace(/\D/g, "")
        : "";

      payload.buyer = {
        name: buyerName,
        email: buyerEmail,
        ...(buyerPhone
          ? { phone: buyerPhone }
          : {}),
        ...(buyerDocument
          ? { document: buyerDocument }
          : {}),
      };
    }

    // =========================
    // PRODUTO
    // =========================

    if (product?.name) {
      payload.product = {
        name: String(product.name),
      };
    }

    // =========================
    // WEBHOOK
    // =========================

    if (siteUrl) {
      payload.postbackUrl =
        `${siteUrl.replace(/\/$/, "")}/api/pixou/webhook`;
    }

    console.log(
      "======================================"
    );

    console.log(
      "PIXOU PAY - ENVIANDO COBRANÇA"
    );

    console.log(
      JSON.stringify(
        {
          ...payload,
          // Nunca exibe a chave secreta
        },
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    // =========================
    // CHAMADA PIXOU
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
    // LER RESPOSTA
    // =========================

    const responseText =
      await response.text();

    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        raw_response: responseText,
      };
    }

    console.log(
      "======================================"
    );

    console.log(
      "PIXOU PAY - RESPOSTA"
    );

    console.log(
      "HTTP STATUS:",
      response.status
    );

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    // =========================
    // ERRO DA PIXOU
    // =========================

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            result?.message ||
            "Não foi possível criar a cobrança Pix.",

          detail:
            result?.error?.detail ||
            result?.detail ||
            result?.errors ||
            null,

          pixou_response: result,

          status: response.status,
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
      "======================================"
    );

    console.error(
      "ERRO INTERNO PIXOU PAY:"
    );

    console.error(error);

    console.error(
      "======================================"
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao criar o pagamento Pix.",

        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}
