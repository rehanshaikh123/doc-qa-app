const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAnswer(context, question, chatHistory = []) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const systemPrompt = `You are a helpful document assistant. Today's date is ${today}.
Answer questions based ONLY on the provided document context below.
Be concise and accurate. If the answer is not found in the context, say "I couldn't find that information in the uploaded document."
When calculating ages or time differences, use today's date (${today}) as the current date.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Document Context:\n\n${context}\n\n---\n\nPlease answer based on the above context only.`
    },
    { role: 'assistant', content: 'Understood. I will answer based only on the provided document context.' },
    ...chatHistory.slice(-6),
    { role: 'user', content: question }
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.3,
    max_tokens: 1024
  });

  return completion.choices[0].message.content;
}

module.exports = { generateAnswer };