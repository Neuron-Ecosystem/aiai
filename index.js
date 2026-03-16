import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Встроенный fetch также доступен начиная с Node 18, но оставим для совместимости

dotenv.config();

const app = express();
// Vercel задает порт автоматически, но для локальной разработки оставим 3000
const port = process.env.PORT || 3000;

app.use(express.json());

// Настройка CORS: разрешаем запросы только с указанного домена
const allowedOrigins = ['https://neuron-ai-eta.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

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
15. Telegram бот Idea Generate: AI SMM Помощник: пишем посты, генерируем идеи и вирусные заголовки за секунды. Попробуй нейросети в деле! 🚀. Ссылка в телеграм: @idea_generate_bot
16. Telegram бот Анализ Telegram-каналов: Твой личный ИИ-аудитор Telegram-каналов Мгновенный анализ охватов, ER и советы по росту. Ссылка в телеграм: @analysis_tgchannel_bot

КОНТАКТЫ:
* Telegram: https://t.me/neuron_ecosystem
* VK: https://vk.com/club233118101
* TikTok: tiktok.com/@neuron_eco
* Почта: wertq6306@gmail.com

ЕСЛИ ПОЛЬЗОВАТЕЛЬ ГОВОРИТ ПРО РАСПИСАНИЕ ТО ЕМУ ИНТЕРЕСНА КОЛЛЕКЦИЯ study
Отвечай кратко и по делу на русском.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Некорректный или отсутствующий массив "messages".' });
    }

    const contextString = context || 'нет данных';
    
    // Формируем финальный системный промпт с динамическим контекстом
    const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\nДанные пользователя из Firebase: ${contextString}.`;

    // Подготавливаем сообщения для OpenRouter
    const apiMessages = [
      { role: 'system', content: dynamicSystemPrompt },
      ...messages
    ];

    // Выбор одной из бесплатных моделей на OpenRouter
    // Если одна недоступна, OpenRouter может возвращать ошибку, поэтому лучше использовать резервные (models array поддерживается OpenRouter)
    // Но мы для простоты используем надежную flash free, либо openrouter/auto
    const openRouterModel = 'google/gemini-2.5-flash-free'; // Можно поменять на любую свободную (например 'meta-llama/llama-3-8b-instruct:free')

    // Делаем запрос к OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY_AI}`,
        'HTTP-Referer': 'https://ai.neuron-p2p.ru', 
        'X-Title': 'Neuron AI', 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API Error:', errorData);
      return res.status(500).json({ error: 'Ошибка при связи с ИИ. Возможно, сервис временно недоступен.' });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('Внутренняя ошибка сервера:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
});

// Экспортируем app для Vercel
export default app;

// Запускаем сервер только если файл запущен напрямую (не в Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Neuron AI Server is running on port ${port}`);
  });
}
