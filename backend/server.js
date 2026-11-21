// Arquivo principal do backend: liga o servidor na porta 3000.
import express from "express";
import cors from "cors";
import rotas from "./router/rotas.js";

const app = express();
const PORT = 3000;

app.use(cors());          // permite o frontend (Live Server) conversar com o backend
app.use(express.json());  // permite receber JSON no corpo das requisições

app.use("/", rotas);      // todas as rotas ficam em router/rotas.js

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
