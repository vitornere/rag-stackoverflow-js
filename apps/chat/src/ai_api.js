export default async function getResponse(prompt) {
  const response = await fetch("http://localhost:3333/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: prompt
    })
  })

  const data = await response.json();
  return data.response;
}
