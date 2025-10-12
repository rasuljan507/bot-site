import { NextRequest, NextResponse } from 'next/server';

// --- Безопасное чтение переменных окружения ---
const YAGPT_API_KEY = process.env.YAGPT_API_KEY;
const YAGPT_FOLDER_ID = process.env.YAGPT_FOLDER_ID;
const YAGPT_MODEL_URI = process.env.YAGPT_MODEL_URI;
const API_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

/**
 * POST /api/chat
 * Отправляет запрос в YandexGPT LLM.
 */
export async function POST(request: NextRequest) {
  if (!YAGPT_API_KEY || !YAGPT_FOLDER_ID || !YAGPT_MODEL_URI) {
    return NextResponse.json({ error: 'LLM configuration missing on server' }, { status: 500 });
  }

  try {
    // Получаем тело запроса от фронтенда (сообщение пользователя и контекст)
    const { message, context, chatHistory } = await request.json();

    const systemPrompt = `Ты — строгий, но справедливый тренер по питанию. Твои цели:
      1. Проанализировать рацион пользователя на основе его данных.
      2. Предлагать конкретные, реалистичные и вкусные рецепты или продукты.
      3. Использовать контекст профиля: ${context}.
      4. Отвечай всегда на русском языке и используй форматирование Markdown.
      5. Если пользователь только начинает чат, сразу задай ему 3 вопроса: "Напиши, что ты кушал сегодня. Я подскажу, что съесть для твоей цели.", "Есть ли у тебя аллергия на какие-то продукты?", "Что ты вообще не любишь из еды?".`;

    const payload = {
      modelUri: YAGPT_MODEL_URI,
      completionOptions: {
        stream: false,
        temperature: 0.7,
        maxTokens: "2000"
      },
      messages: [
        { role: "system", text: systemPrompt },
        // Добавляем историю чата (если есть)
        ...(chatHistory || []),
        { role: "user", text: message }
      ]
    };

    // Отправка запроса к YandexGPT
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${YAGPT_API_KEY}`,
        'Content-Type': 'application/json',
        'x-folder-id': YAGPT_FOLDER_ID,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YandexGPT API Error:', response.status, errorText);
      return NextResponse.json({ 
        error: `LLM API Error: ${response.status}`, 
        details: errorText 
      }, { status: response.status });
    }

    const responseJson = await response.json();
    const trainerResponse = responseJson?.result?.alternatives?.[0]?.message?.text || "Извините, LLM вернул пустой ответ.";

    return NextResponse.json({ text: trainerResponse });

  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
