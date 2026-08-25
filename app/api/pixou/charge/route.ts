import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PIXOU_PAY_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

    /*
     * ==========================================
     * EXTERNAL ID
     * ==========================================
     */

    if (!external_id) {
      return NextResponse.json(
        {
          error: "external_id é obrigatório.",
        },
        { status: 400 }
      );
    }

    const externalId = String(external_id)
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "");

    if (
      externalId.length < 1 ||
      externalId.length > 255
    ) {
      return NextResponse.json(
        {
          error:
            "external_id deve possuir entre 1 e 255 caracteres.",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * VALOR
     * ==========================================
     *
     * A Pixou trabalha em CENTAVOS.
     *
     * Exemplo:
     * R$ 24,80 = 2480
     */

    const numericAmount = Number(amount);

    if (!Number.isInteger(numericAmount)) {
      return NextResponse.json(
        {
          error:
            "O valor enviado deve ser um número inteiro em centavos.",
          received: amount,
        },
        { status: 400 }
      );
    }

    if (numericAmount < 600) {
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

    /*
     * ==========================================
     * PAYLOAD BASE
     * ==========================================
     */

    const payload: Record<string, unknown> = {
      external_id: externalId,
      payment_method: "pix",
      amount: numericAmount,
    };

    /*
     * ==========================================
     * BUYER
     * ==========================================
     */

    if (buyer) {
      const buyerName = String(
        buyer.name || ""
      ).trim();

      const buyerEmail = String(
        buyer.email || ""
      ).trim();

      if (
        buyerName.length < 3 ||
        buyerName.length > 100
      ) {
        return NextResponse.json(
          {
            error:
              "O nome deve possuir entre 3 e 100 caracteres.",
          },
          { status: 400 }
        );
      }

      if (!buyerEmail) {
        return NextResponse.json(
          {
            error: "O e-mail do comprador é obrigatório.",
          },
          { status: 400 }
        );
      }

      /*
       * WhatsApp
       *
       * A Pixou aceita 12 ou 13 dígitos.
       *
       * Se o cliente digitar:
       * (91) 99999-9999
       *
       * vira:
       * 91999999999
       *
       * Depois adicionamos 55:
       * 5591999999999
       */

      let phone = "";

      if (buyer.phone) {
        const rawPhone = String(
          buyer.phone
        ).replace(/\D/g, "");

        if (rawPhone.length === 11) {
          phone = `55${rawPhone}`;
        } else if (
          rawPhone.length === 12 ||
          rawPhone.length === 13
        ) {
          phone = rawPhone;
        } else {
          return NextResponse.json(
            {
              error:
                "O WhatsApp informado é inválido. Informe um número brasileiro com DDD.",
            },
            { status: 400 }
          );
        }
      }

      const buyerPayload: Record<string, unknown> = {
        name: buyerName,
        email: buyerEmail,
      };

      if (phone) {
        buyerPayload.phone = phone;
      }

      /*
       * Documento é opcional.
       * Só enviamos se realmente existir.
       */

      if (buyer.document) {
        const document = String(
          buyer.document
        ).replace(/\D/g, "");

        if (document.length > 0) {
          buyerPayload.document = document;
        }
      }

      payload.buyer = buyerPayload;
    }

    /*
     * ==========================================
     * PRODUCT
     * ==========================================
     */

    if (product?.name) {
      const productName = String(
        product.name
      ).trim();

      if (productName) {
        payload.product = {
          name: productName,
        };
      }
    }

    /*
     * ==========================================
     * WEBHOOK
     * ==========================================
     */

    if (siteUrl) {
      const cleanSiteUrl = siteUrl.replace(
        /\/$/,
        ""
      );

      payload.postbackUrl =
        `${cleanSiteUrl}/api/pixou/webhook`;
    }

    /*
     * ==========================================
     * LOG DO PAYLOAD
     * ==========================================
     */

    console.log(
      "PIXOU - PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    /*
     * ==========================================
     * ENVIA PARA PIXOU
     * ==========================================
     */

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

    /*
     * ==========================================
     * LÊ A RESPOSTA
     * ==========================================
     */

    const responseText = await response.text();

    let result: any = null;

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
      JSON.stringify(result, null, 2)
    );

    /*
     * ==========================================
     * ERRO DA PIXOU
     * ==========================================
     */

    if (!response.ok) {
      const pixouError =
        result?.error || {};

      return NextResponse.json(
        {
          error:
            pixouError?.message ||
            "A Pixou recusou a criação da cobrança.",

          detail:
            pixouError?.detail ??
            result?.detail ??
            null,

          status: response.status,

          pixou_response: result,
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * ==========================================
     * SUCESSO
     * ==========================================
     */

    if (!result?.data) {
      return NextResponse.json(
        {
          error:
            "A Pixou respondeu sem retornar os dados da cobrança.",
          pixou_response: result,
        },
        { status: 502 }
      );
    }

    if (!result.data?.pix?.code) {
      return NextResponse.json(
        {
          error:
            "A Pixou criou a cobrança, mas não retornou o Pix Copia e Cola.",
          pixou_response: result,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      result,
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PIXOU - ERRO INTERNO:",
      error
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
      { status: 500 }
    );
  }
}
