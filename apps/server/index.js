import express from "express";
import cors from "cors";
import { getAnswer } from "@rag-stackoverflow-js/langchain";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/ask", async (req, res) => {
    const { question } = req.body;
    const output = await getAnswer(question);
    res.json({
        response: output
    });
});

app.listen(3333, () => {
    console.log("Server is running on port 3333");
}).on("error", (error) => {
    console.error("Error starting server:", error);
});
