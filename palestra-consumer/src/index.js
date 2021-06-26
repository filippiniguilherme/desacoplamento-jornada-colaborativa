import AWS from "aws-sdk";
import nodemailer from "nodemailer";
import { Consumer } from "sqs-consumer";
require("dotenv").config();

AWS.config.update({ region: "sa-east-1" });

const queueUrl = process.env.QUEUE_URL;

let transport = nodemailer.createTransport({
  host: "smtp.googlemail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

const sendMail = (message) => {
  let sqsMessage = JSON.parse(message.Body);
  const emailMessage = {
    from: "summitpalestraguilherme@gmail.com",
    to: sqsMessage.userEmail,
    subject: "Pedido recebido",
    html: `
      <p>Ola ${sqsMessage.userEmail}. </p> <br/>
      <p> Seu pedido de ${sqsMessage.itemName}
      foi recebido e esta sendo processado.</p> <p> Obrigado por comprar conosco! </p>
    `,
  };

  transport.sendMail(emailMessage, (err, info) => {
    if (err) {
      console.log(`Servico de email | ERROR: ${err}`);
    }
    console.log(`Servico de email | INFO: ${info.messageId}`);
  });
};

const app = Consumer.create({
  queueUrl: queueUrl,
  handleMessage: async (message) => {
    sendMail(message);
  },
  sqs: new AWS.SQS(),
});

app.on("error", (err) => {
  console.log(err.message);
});

app.on("processing_error", (err) => {
  console.log(err.message);
});

console.log("Servico de emails executando...");
app.start();
