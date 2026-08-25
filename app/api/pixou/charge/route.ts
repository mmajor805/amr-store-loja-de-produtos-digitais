import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PIXOU_PAY_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "PIXOU_PAY_SECRET_KEY não está configurada na Vercel.",
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

    // =====================================================
    // EXTERNAL ID
    // =====================================================

    if (!external_id) {
      return NextResponse.json(
        {
          error: "external_id é obrigatório.",
        },
        { status: 400 }
      );
    }

    const externalId = String(external_id).trim();

    // A Pixou aceita apenas:
    // letras, números, hífens e underscores
    if (
      externalId.length < 1 ||
      externalId.length > 255 ||
      !/^[a-zA-Z0-9_-]+$/.test(externalId)
    ) {
      return NextResponse.json(
        {
          error:
            "external_id inválido. Use apenas letras, números, hífens e underscores.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALOR
    // =====================================================

    const numericAmount = Number(amount);

    if (!Number.isInteger(numericAmount)) {
      return NextResponse.json(
        {
          error:
            "O valor da cobrança precisa ser um número inteiro em centavos.",
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

    // =====================================================
    // BUYER
    // =====================================================

    let formattedBuyer:
      | {
          name: string;
          email: string;
          phone?: string;
          document?: string;
        }
      | undefined;

    if (buyer) {
      const buyerName = String(buyer.name || "").trim();
      const buyerEmail = String(buyer.email || "")
        .trim()
        .toLowerCase();

      if (
        buyerName.length < 3 ||
        buyerName.length > 100
      ) {
        return NextResponse.json(
          {
            error:
              "O nome deve ter entre 3 e 100 caracteres.",
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

      // Validação simples de e-mail
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          buyerEmail
        )
      ) {
        return NextResponse.json(
          {
            error: "Digite um e-mail válido.",
          },
          { status: 400 }
        );
      }

      // ---------------------------------------------------
      // TELEFONE
      // ---------------------------------------------------

      let formattedPhone: string | undefined;

      if (buyer.phone) {
        let phone = String(buyer.phone).replace(
          /\D/g,
          ""
        );

        /*
         * A Pixou exige:
         * 12 ou 13 dígitos.
         *
         * Brasil:
         * 55 + DDD + número
         */

        if (phone.startsWith("55")) {
          // Já está com código do Brasil
          formattedPhone = phone;
        } else if (
          phone.length === 10 ||
          phone.length === 11
        ) {
          // Adiciona o código do Brasil
          formattedPhone = `55${phone}`;
        } else {
          return NextResponse.json(
            {
              error:
                "WhatsApp inválido. Digite o número com DDD, por exemplo: (91) 99999-9999.",
            },
            { status: 400 }
          );
        }

        if (
          formattedPhone.length !== 12 &&
          formattedPhone.length !== 13
        ) {
          return NextResponse.json(
            {
              error:
                "WhatsApp inválido. A Pixou exige telefone com 12 ou 13 dígitos.",
            },
            { status: 400 }
          );
        }
      }

      // ---------------------------------------------------
      // DOCUMENTO
      // ---------------------------------------------------

      let formattedDocument: string | undefined;

      if (buyer.document) {
        formattedDocument = String(
          buyer.document
        ).replace(/\D/g, "");

        if (
          formattedDocument.length !== 11 &&
          formattedDocument.length !== 14
        ) {
          return NextResponse.json(
            {
              error:
                "CPF/CNPJ inválido.",
            },
            { status: 400 }
          );
        }
      }

      formattedBuyer = {
        name: buyerName,
        email: buyerEmail,
        ...(formattedPhone
          ? { phone: formattedPhone }
          : {}),
        ...(formattedDocument
          ? { document: formattedDocument }
          : {}),
      };
    }

    // =====================================================
    // PAYLOAD PIXOU
    // =====================================================

    const payload: Record<string, unknown> = {
      external_id: externalId,

      payment_method: "pix",

      amount: numericAmount,
    };

    // Buyer
    if (formattedBuyer) {
      payload.buyer = formattedBuyer;
    }

    // Product
    if (
      product &&
      product.name &&
      String(product.name).trim()
    ) {
      payload.product = {
        name: String(product.name).trim(),
      };
    }

    // =====================================================
    // WEBHOOK
    // =====================================================

    if (siteUrl) {
      const cleanSiteUrl = siteUrl.replace(
        /\/$/,
        ""
      );

      payload.postbackUrl =
        `${cleanSiteUrl}/api/pixou/webhook`;
    }

    console.log(
      "Enviando cobrança para Pixou:",
      JSON.stringify(
        {
          ...payload,
          // Não mostra informações sensíveis
          // do comprador nos logs.
          buyer: formattedBuyer
            ? {
                name: formattedBuyer.name,
                email: formattedBuyer.email,
                phone: formattedBuyer.phone
                  ? "***"
                  : undefined,
              }
            : undefined,
        },
        null,
        2
      )
    );

    // =====================================================
    // REQUISIÇÃO PIXOU
    // =====================================================

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

    // =====================================================
    // RESPOSTA
    // =====================================================

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Erro retornado pela Pixou Pay:",
        JSON.stringify(result, null, 2)
      );

      const pixouMessage =
        result?.error?.message;

      const pixouDetail =
        result?.error?.detail;

      let detailMessage = "";

      if (typeof pixouDetail === "string") {
        detailMessage = pixouDetail;
      } else if (pixouDetail) {
        try {
          detailMessage = JSON.stringify(
            pixouDetail
          );
        } catch {
          detailMessage = "";
        }
      }

      return NextResponse.json(
        {
          error:
            pixouMessage ||
            "Não foi possível criar a cobrança Pix.",

          detail:
            detailMessage || null,

          pixou_error:
            result?.error || null,
        },
        {
          status: response.status,
        }
      );
    }

    // =====================================================
    // VALIDAÇÃO DA RESPOSTA
    // =====================================================

    if (!result?.data) {
      return NextResponse.json(
        {
          error:
            "A Pixou Pay não retornou os dados da cobrança.",
          detail: result,
        },
        { status: 502 }
      );
    }

    if (!result.data.id) {
      return NextResponse.json(
        {
          error:
            "A Pixou Pay não retornou o ID da transação.",
        },
        { status: 502 }
      );
    }

    if (!result.data.pix) {
      return NextResponse.json(
        {
          error:
            "A Pixou Pay não retornou os dados do Pix.",
        },
        { status: 502 }
      );
    }

    if (!result.data.pix.code) {
      return NextResponse.json(
        {
          error:
            "A Pixou Pay não retornou o código Pix Copia e Cola.",
        },
        { status: 502 }
      );
    }

    console.log(
      "Cobrança Pix criada com sucesso:",
      result.data.id
    );

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
