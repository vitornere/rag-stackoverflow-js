import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const url = "https://eloquentjavascript.net/1st_edition/print.html";
const cheerioLoader = new CheerioWebBaseLoader(url, { selector: ".block" });

console.log("Loading documents...");
const docs = await cheerioLoader.load();

console.log("Splitting documents...");
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500, chunkOverlap: 300 });
const allSplits = await splitter.splitDocuments(docs);

console.log("Embedding documents...");
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  taskType: "RETRIEVAL_DOCUMENT",
});

console.log("Creating vector store + inserting documents...");
await Chroma.fromDocuments(allSplits, embeddings, {
  collectionName: "javascript-book-genai",
  url: "http://localhost:8008",
});

console.log("Done!");
