import { ChromaClient } from "chromadb";

const client = new ChromaClient({
	host: "localhost",
    port: 8008,
    ssl: false,
});

const collection = await client.getOrCreateCollection({
    name: "javascript-book"
});

const results = await collection.query({
    queryTexts: ["How functions work?"],
    nResults: 2,
});

console.log(results);
