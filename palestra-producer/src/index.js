import express from "express";
import AWS from "aws-sdk";
AWS.config.update({ region: "sa-east-1" });
require("dotenv").config();

const app = express();
const sqs = new AWS.SQS();
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Bem vindo(a) a nossa loja!");
});

app.post("/order", (req, res) => {
  const orderData = {
    userEmail: req.body["userEmail"],
    itemName: req.body["itemName"],
    itemPrice: req.body["itemPrice"],
    itemsQuantity: req.body["itemsQuantity"],
  };

  const sqsOrderData = {
    MessageAttributes: {
      userEmail: {
        DataType: "String",
        StringValue: orderData.userEmail,
      },
      itemName: {
        DataType: "String",
        StringValue: orderData.itemName,
      },
      itemPrice: {
        DataType: "String",
        StringValue: orderData.itemPrice,
      },
      itemsQuantity: {
        DataType: "String",
        StringValue: orderData.itemsQuantity,
      },
    },
    MessageBody: JSON.stringify(orderData),
    MessageGroupId: "UserOrders",
    MessageDeduplicationId: req.body["userEmail"],
    QueueUrl: process.env.QUEUE_URL,
  };

  const sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
  sendSqsMessage
    .then((data) => {
      console.log(`Servico de Pedidos | SUCCESS: ${data.MessageId}`);
      res.send(
        "Obrigado pelo seu pedido. Cheque sua caixa de entrada pelo e-mail de confirmacao do pedido."
      );
    })
    .catch((err) => {
      console.log(`Servico de Pedidos | ERROR: ${err}`);
      res.send("Ocoreu um erro, tente novamente!");
    });
});

console.log("Servico de pedido executando...");
app.listen(3000);
