import * as cheerio from "cheerio";
import { ChromaClient } from "chromadb";

const url = "https://eloquentjavascript.net/1st_edition/print.html";

const response = await fetch(url);
const htmlString = await response.text();
const $ = cheerio.load(htmlString);

const documents = $(".block")
	.toArray()
	.map((block) => $(block).text());

const client = new ChromaClient({
	host: "localhost",
    port: 8008,
    ssl: false,
});

const collection = await client.getOrCreateCollection({
    name: "javascript-book"
});

await collection.add({
    documents,
    metadatas: documents.map((document) => ({
        source: url,
    })),
    ids: documents.map((_, index) => index.toString()),
});

console.log("Documents added to collection");
