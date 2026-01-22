import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { pull } from "langchain/hub"
import { StateGraph, Annotation } from "@langchain/langgraph";

const DEBUG = process.env.DEBUG === "true" || process.env.DEBUG === "1";

const log = (...args) => {
  if (DEBUG) console.log("[langchain]", ...args);
};

let graph = null;

const initializeGraph = async () => {
  if (graph) {
    log("Graph already initialized, reusing cached instance");
    return graph;
  }

  log("Initializing graph...");

  log("Creating embeddings with model: text-embedding-004");
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    taskType: "RETRIEVAL_DOCUMENT",
  });

  log("Connecting to ChromaDB at http://localhost:8008");
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: "javascript-book-genai",
    url: "http://localhost:8008",
  });
  log("ChromaDB connected successfully");

  log("Pulling prompt template: rlm/rag-prompt");
  const promptTemplate = await pull("rlm/rag-prompt");
  log("Prompt template loaded");

  log("Creating LLM with model: gemini-2.0-flash");
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  });

  const retrieve = async (state) => {
    log("RETRIEVE: Searching for similar documents...");
    log("RETRIEVE: Question:", state.question);
    const results = await vectorStore.similaritySearch(state.question, 4);
    log("RETRIEVE: Found", results.length, "documents");
    results.forEach((doc, i) => {
      log(`RETRIEVE: Doc ${i + 1} preview:`, doc.pageContent.substring(0, 100) + "...");
    });
    return { docs: results };
  };

  const generate = async (state) => {
    log("GENERATE: Preparing prompt with", state.docs.length, "documents");
    const docs = state.docs.map(doc => doc.pageContent).join("\n\n");
    log("GENERATE: Context length:", docs.length, "chars");
    const prompt = await promptTemplate.invoke({
      context: docs,
      question: state.question,
    });
    log("GENERATE: Invoking LLM...");
    const response = await llm.invoke(prompt);
    log("GENERATE: Response received, length:", response.content.length, "chars");
    return { answer: response }
  }

  const StateAnnotation = Annotation.Root({
      question: Annotation,
      docs: Annotation,
      answer: Annotation
  })
  
  graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

  log("Graph compiled successfully");
  return graph;
};

export const getAnswer = async (question) => {
    log("=== New request ===");
    log("Question:", question);
    const startTime = Date.now();
    
    const g = await initializeGraph();
    const inputs = { question };
    const output = await g.invoke(inputs);
    
    const elapsed = Date.now() - startTime;
    log("Total time:", elapsed, "ms");
    log("=== Request complete ===");
    
    return output.answer.content;
}
