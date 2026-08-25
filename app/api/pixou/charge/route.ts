import { NextResponse } from "next/server";

function onlyNumbers(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

function isValidCPF(value: string): boolean {
  const cpf = onlyNumbers(value);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let remainder = (sum * 10) % 11;

  if (remainder === 10) {
    remainder = 0;
  }

  if (remainder !== Number(cpf[9])) {
    return false;
  }

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10) {
    remainder = 0;
  }

  return remainder === Number(cpf[10]);
}

function isValidCNPJ(value: string): boolean {
  const cnpj = onlyNumbers(value);

  if (cnpj.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const firstWeights = [
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ];

  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum +=
      Number(cnpj[i]) *
      firstWeights[i];
  }

  let remainder = sum % 11;
  const digit1 =
    remainder < 2 ? 0 : 11 - remainder;

  if (digit1 !== Number(cnpj[12])) {
    return false;
  }

  const secondWeights = [
    6,
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ];

  sum = 0;

  for (let i = 0; i < 13; i++) {
    sum +=
      Number(cnpj[i]) *
      secondWeights[i];
  }

  remainder = sum % 11;
  const digit2 =
    remainder < 2 ? 0 : 11 - remainder;

  return digit2 === Number(cnpj[13]);
}

function isValidDocument(value: string): boolean {
  const document = onlyNumbers(value);

  if (document.length === 11) {
    return isValidCPF(document);
  }

  if (document.length === 14) {
    return isValidCNPJ(document);
  }

  return false;
}

function normalizePhone(value: unknown): string {
  const phone = onlyNumbers(value);

  if (phone.length === 11) {
    return `55${phone}`;
  }

  if (
    phone.length === 12 ||
    phone.length === 13
  ) {
    return phone;
  }

  return "";
}

export async function POST(
  request: Request
) {
  try {
    /*
     * ==========================================
     * CONFIGURAÇÃO
     * ==========================================
     */

    const secretKey =
      process.env.PIXOU_PAY_SECRET_KEY;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "PIXOU_PAY_SECRET_KEY não configurada na Vercel.",
        },
        { status: 500 }
      );
    }

    /*
     * ==========================================
     * RECEBE O CHECKOUT
     * ==========================================
     */

    const body =
      await request.json();

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
          error:
            "external_id é obrigatório.",
        },
        { status: 400 }
      );
    }

    const externalId =
      String(external_id)
        .trim()
        .replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );

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
     */

    const numericAmount =
      Number(amount);

    if (
      !Number.isInteger(
        numericAmount
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O valor deve ser um número inteiro em centavos.",
          received: amount,
        },
        { status: 400 }
      );
    }

    if (
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

    if (
      numericAmount > 300000
    ) {
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
     * BUYER
     * ==========================================
     */

    if (!buyer) {
      return NextResponse.json(
        {
          error:
            "Os dados do comprador são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const buyerName =
      String(
        buyer.name ?? ""
      ).trim();

    const buyerEmail =
      String(
        buyer.email ?? ""
      ).trim();

    const buyerDocument =
      onlyNumbers(
        buyer.document
      );

    const buyerPhone =
      normalizePhone(
        buyer.phone
      );

    /*
     * NOME
     */

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

    /*
     * E-MAIL
     */

    if (!buyerEmail) {
      return NextResponse.json(
        {
          error:
            "O e-mail do comprador é obrigatório.",
        },
        { status: 400 }
      );
    }

    /*
     * CPF/CNPJ
     */

    if (!buyerDocument) {
      return NextResponse.json(
        {
          error:
            "CPF ou CNPJ é obrigatório.",
        },
        { status: 400 }
      );
    }

    if (
      !isValidDocument(
        buyerDocument
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O CPF ou CNPJ informado é inválido.",
        },
        { status: 400 }
      );
    }

    /*
     * WHATSAPP
     */

    if (!buyerPhone) {
      return NextResponse.json(
        {
          error:
            "O WhatsApp informado é inválido. Informe um número com DDD.",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * PAYLOAD PARA PIXOU
     * ==========================================
     *
     * Conforme a documentação:
     *
     * external_id
     * payment_method
     * amount
     * buyer
     * product
     * postbackUrl
     *
     * O document é enviado em buyer.document.
     * A Pixou internamente utiliza esse valor
     * como payer.taxId.
     */

    const payload: Record<
      string,
      unknown
    > = {
      external_id:
        externalId,

      payment_method:
        "pix",

      amount:
        numericAmount,

      buyer: {
        name:
          buyerName,

        email:
          buyerEmail,

        phone:
          buyerPhone,

        document:
          buyerDocument,
      },
    };

    /*
     * PRODUTO
     */

    if (
      product?.name
    ) {
      const productName =
        String(
          product.name
        ).trim();

      if (productName) {
        payload.product = {
          name:
            productName,
        };
      }
    }

    /*
     * WEBHOOK
     */

    if (siteUrl) {
      const cleanSiteUrl =
        siteUrl.replace(
          /\/$/,
          ""
        );

      payload.postbackUrl =
        `${cleanSiteUrl}/api/pixou/webhook`;
    }

    /*
     * ==========================================
     * LOG
     * ==========================================
     *
     * Não mostramos o CPF completo no log.
     */

    const logPayload = {
      ...payload,
      buyer: {
        ...(payload.buyer as Record<
          string,
          unknown
        >),
        document:
          buyerDocument.length === 11
            ? `***${buyerDocument.slice(
                3,
                9
              )}**`
            : `***${buyerDocument.slice(
                3,
                11
              )}**`,
      },
    };

    console.log(
      "PIXOU - PAYLOAD:",
      JSON.stringify(
        logPayload,
        null,
        2
      )
    );

    /*
     * ==========================================
     * CHAMADA PIXOU
     * ==========================================
     */

    const response =
      await fetch(
        "https://api.pixoupay.com/charge",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${secretKey}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),

          cache:
            "no-store",
        }
      );

    /*
     * ==========================================
     * RESPOSTA
     * ==========================================
     */

    const responseText =
      await response.text();

    let result: any;

    try {
      result =
        JSON.parse(
          responseText
        );
    } catch {
      result = {
        raw:
          responseText,
      };
    }

    console.log(
      "PIXOU - STATUS:",
      response.status
    );

    console.log(
      "PIXOU - RESPONSE:",
      JSON.stringify(
        result,
        null,
        2
      )
    );

    /*
     * ==========================================
     * ERRO PIXOU
     * ==========================================
     */

    if (!response.ok) {
      const pixouError =
        result?.error ?? {};

      return NextResponse.json(
        {
          error:
            pixouError?.message ||
            "A Pixou recusou a criação da cobrança.",

          detail:
            pixouError?.detail ??
            null,

          code:
            pixouError?.code ??
            null,

          status:
            response.status,
        },
        {
          status:
            response.status,
        }
      );
    }

    /*
     * ==========================================
     * VALIDA RESPOSTA
     * ==========================================
     */

    if (!result?.data) {
      return NextResponse.json(
        {
          error:
            "A Pixou não retornou os dados da cobrança.",
        },
        { status: 502 }
      );
    }

    if (
      !result.data?.pix?.code
    ) {
      return NextResponse.json(
        {
          error:
            "A Pixou criou a cobrança, mas não retornou o Pix Copia e Cola.",
        },
        { status: 502 }
      );
    }

    /*
     * ==========================================
     * SUCESSO
     * ==========================================
     */

    return NextResponse.json(
      result,
      {
        status: 200,
      }
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
