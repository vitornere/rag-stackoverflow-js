import { GoogleGenAI } from "@google/genai";
import { ChromaClient } from "chromadb";

const client = new ChromaClient({
    host: "localhost",
    port: 8008,
    ssl: false,
});

const collection = await client.getOrCreateCollection({
    name: "javascript-book"
});

const genai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const userQuestion = "What is a function?";

// "Retrieval" from Retrieval-augmented generation
const retrievedChunks = async (question) => {
    const results = await collection.query({
        queryTexts: [question],
        nResults: 5,
    });

    return results.documents[0].join("\n\n==========\n\n");
}

// "Augment" from Retrieval-augmented generation
const systemInstruction = `
You are an expert in JavaScript and you are tasked with answering questions about the JavaScript language.

Answer the question based on the following excerpts from the book "Eloquent JavaScript".
In your response, reference the passages below.

${await retrievedChunks(userQuestion)}
`; 

// "Generation" from Retrieval-augmented generation
const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userQuestion,
    config: {
        systemInstruction,
    }
});

console.log(response.candidates[0].content.parts[0].text); 
