import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(
      "========== WEBHOOK PIXOU PAY =========="
    );
    console.log(
      JSON.stringify(body, null, 2)
    );
    const event = body?.event;
    const data = body?.data;
    if (!data) {
      console.error(
        "Webhook sem dados da transação."
      );
      return NextResponse.json(
        {
          error: "Dados da transação não encontrados.",
        },
        { status: 400 }
      );
    }
    /*
     * TRANSAÇÃO CRIADA
     */
    if (event === "transaction.created") {
      console.log(
        "Transação criada:",
        data.id
      );
      return NextResponse.json({
        received: true,
        event: "transaction.created",
        status: data.status || "pending",
        transaction_id: data.id,
      });
    }
    /*
     * PAGAMENTO CONFIRMADO
     */
    if (
      event === "transaction.processed" ||
      data.status === "paid"
    ) {
      console.log(
        "================================="
      );
      console.log(
        "PAGAMENTO CONFIRMADO!"
      );
      console.log(
        "ID:",
        data.id
      );
      console.log(
        "Status:",
        data.status
      );
      console.log(
        "Valor:",
        data.total_amount
      );
      console.log(
        "Cliente:",
        data.buyer?.name
      );
      console.log(
        "E-mail:",
        data.buyer?.email
      );
      console.log(
        "================================="
      );
      /*
       * AQUI VAMOS COLOCAR A ENTREGA
       * AUTOMÁTICA DO PRODUTO.
       *
       * Por enquanto apenas confirmamos
       * que o pagamento foi recebido.
       */
      return NextResponse.json({
        received: true,
        event: "transaction.processed",
        status: "paid",
        transaction_id: data.id,
      });
    }
    /*
     * OUTROS EVENTOS
     */
    console.log(
      "Evento não tratado:",
      event
    );
    return NextResponse.json({
      received: true,
      event: event || null,
      status: data.status || null,
    });
  } catch (error) {
    console.error(
      "Erro ao processar webhook:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Erro interno ao processar webhook.",
      },
      { status: 500 }
    );
  }
}
