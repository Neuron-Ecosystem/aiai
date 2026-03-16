export const config = {
  runtime: 'edge', // Используем Edge для максимальной скорости
};

const SYSTEM_PROMPT = `Ты — Neuron AI, инновационный и дружелюбный ИИ-ассистент, созданный командой Neuron Ecosystem. Твоя основная задача — помогать пользователям, предоставляя точную информацию о нашей экосистеме. Наша команда состоит из двух молодых и амбициозных разработчиков по 14 лет, что делает наши решения особенно новаторскими. Отвечай всегда на русском языке, сохраняя позитивный и профессиональный тон.

ПРОЕКТЫ NEURON ECOSYSTEM:
1. Neuron Notes: https://notes.neuron-p2p.ru
2. Neuron Converter: https://converter.neuron-p2p.ru
3. Neuron Digital Studio: https://neurondigital.tilda.ws/
4. Neuron Tools: https://tools.neuron-p2p.ru
5. Neuron Calendar: https://calendar.neuron-p2p.ru
6. Neuron Study: https://study.neuron-p2p.ru
7. Neuron Budget: https://budget.neuron-p2p.ru
8. Neuron Game Hub: https://game-hub.neuron-p2p.ru
9. Neuron Password Generator: https://password-generator.neuron-p2p.ru
10. Synapse: https://synapse.neuron-p2p.ru
11. Neuron AI: https://neuron-ai-eta.vercel.app/
12. What If: https://ifwhat.ru
13. Neuron Status: https://status.neuron-p2p.ru
14. Neuron Link: https://link.neuron-p2p.ru
15. Idea Generate (@idea_generate_bot)
16. Анализ Telegram-каналов (@analysis_tgchannel_bot)

КОНТАКТЫ:
* Telegram: https://t.me/neuron_ecosystem
* VK: https://vk.com/club233118101
* Почта: wertq6306@gmail.com

ЕСЛИ ПОЛЬЗОВАТЕЛЬ ГОВОРИТ ПРО РАСПИСАНИЕ ТО ЕМУ ИНТЕРЕСНА КОЛЛЕКЦИЯ study
Отвечай кратко и по делу на русском.`;

export default async function handler(req) {
  // 1. Обработка CORS (чтобы фронтенд мог достучаться)
  const headers = {
    'Access-Control-Allow-Origin': '*', // Можно заменить на 'https://neuron-ai-eta.vercel.app'
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
  }

  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), { status: 400, headers });
    }

    const API_KEY = process.env.API_KEY_AI;
    const contextString = context || 'нет данных';

    // Запрос к OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://ai.neuron-p2p.ru',
        'X-Title': 'Neuron AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001', // Оптимальная модель
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nКонтекст Firebase: ${contextString}` },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Error:', data);
      return new Response(JSON.stringify({ error: 'OpenRouter API Error' }), { status: 500, headers });
    }

    // Возвращаем только текст ответа, как ожидает твой фронтенд
    const aiText = data.choices[0]?.message?.content || 'Извините, я не смог сформулировать ответ.';
    
    return new Response(JSON.stringify({ response: aiText }), { status: 200, headers });

  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
