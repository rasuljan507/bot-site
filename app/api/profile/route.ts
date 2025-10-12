import { NextRequest, NextResponse } from 'next/server';
import pgp from 'pg-promise';

// --- 1. Инициализация PostgreSQL ---
// Vercel безопасно использует DATABASE_URL из Environment Variables

const initOptions = { capSQL: true }; // capSQL должен быть в опциях инициализации
const db = pgp(initOptions)(process.env.DATABASE_URL as string);

// Тип для профиля, чтобы избежать ошибок TypeScript
interface UserProfile {
    telegram_id: number;
    goal: string;
    meal_frequency: string;
    target_calories: number;
    target_protein: number;
    target_fat: number;
    target_carbs: number;
    weight: number;
    age: number;
    gender: string;
    // Добавьте другие поля, если нужно
}

/**
 * GET /api/profile?id=...
 * Получает профиль пользователя из PostgreSQL.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramIdParam = searchParams.get('id');

    if (!telegramIdParam) {
      return NextResponse.json({ error: 'Missing telegram ID' }, { status: 400 });
    }

    const telegram_id = parseInt(telegramIdParam, 10);

    // 2. Выполнение запроса к БД
    const query = `
      SELECT 
        telegram_id, goal, meal_frequency, target_calories, target_protein, 
        target_fat, target_carbs, weight, age, gender
      FROM 
        users 
      WHERE 
        telegram_id = $1
    `;
    
    // ВАЖНО: db.oneOrNone гарантирует, что мы либо получим 1 запись, либо null
    const user = await db.oneOrNone<UserProfile>(query, [telegram_id]);

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
