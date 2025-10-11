'use client'; // Указываем Next.js, что это интерактивный клиентский компонент

import React, { useState } from 'react';
import { MessageSquare, User, Send, ChevronLeft, LogOut, Clock, Target, Calendar } from 'lucide-react';

// ====================================================================
// ТИПЫ ДАННЫХ (INTERFACES) для работы с TypeScript
// ====================================================================

interface Message {
  role: 'trainer' | 'user';
  text: string;
}

interface UserProfile {
  telegramId?: number; // Будет получен из Telegram Web App
  name: string;
  goal: 'loss' | 'gain' | 'maintain';
  weight: number;
  age: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  mealFrequency: string;
  isSubscribed: boolean;
}

// ====================================================================
// ЗАГЛУШКИ ДАННЫХ (Будут заменены реальными API-вызовами)
// ====================================================================

const mockUserProfile: UserProfile = {
  telegramId: 1056878733,
  name: "Юсуф",
  goal: "loss",
  weight: 88,
  age: 21,
  targetCalories: 1829,
  targetProtein: 220,
  targetFat: 88,
  targetCarbs: 39,
  mealFrequency: "3-5 раз",
  isSubscribed: true,
};

const mockChatHistory: Message[] = [
  { role: 'trainer', text: 'Привет, Юсуф! Я вижу твоя цель — **Снижение веса**. Давай начнем с главного.' },
  { role: 'trainer', text: '**Напиши, что ты кушал сегодня. Я подскажу, что съесть для твоей цели. Также ответь:**\n\n- Есть ли у тебя аллергия на какие-то продукты?\n- Что ты вообще не любишь из еды?' },
];

// ====================================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ====================================================================

interface ProfileCardProps {
  icon: React.ReactElement<any>;
  title: string;
  value: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ icon, title, value }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
      {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-indigo-500' })}
      <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="font-semibold text-gray-800">{value}</p>
      </div>
  </div>
);

interface TargetStatProps {
  title: string;
  value: string | number;
  color: string;
}

const TargetStat: React.FC<TargetStatProps> = ({ title, value, color }) => (
  <div className="p-3 bg-gray-50 rounded-xl shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
  </div>
);


// ====================================================================
// ОСНОВНЫЕ КОМПОНЕНТЫ РАЗДЕЛОВ
// ====================================================================

interface ChatViewProps {
  profile: UserProfile;
  setPage: (page: 'chat' | 'profile') => void;
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatView: React.FC<ChatViewProps> = ({ profile, setPage, chatHistory, setChatHistory }) => {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  // В реальном проекте тут будет обработчик LLM
  
  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const newUserMessage: Message = { role: 'user', text: inputText.trim() };
    setChatHistory(prev => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);

    // Имитация задержки LLM
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Имитация ответа LLM
    const trainerResponse: Message = { 
      role: 'trainer', 
      text: `*Анализ твоего сообщения "${newUserMessage.text}" в процессе...*\n\nПоскольку ты на снижении веса, LLM-тренер рекомендует следующий прием пищи: 150г творога 5% с ягодами.` 
    };
    
    setChatHistory(prev => [...prev, trainerResponse]);
    setLoading(false);
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
          Чат с Тренером
        </h1>
        <button 
          onClick={() => setPage('profile')} 
          className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-500 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {/* Используем dangerouslySetInnerHTML для рендеринга Markdown-подобного текста LLM */}
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-gray-100 text-gray-600 rounded-tl-none animate-pulse">
              Тренер думает...
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Спроси у тренера..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            className={`p-3 rounded-lg text-white transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            disabled={loading}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProfileViewProps {
  profile: UserProfile;
  setPage: (page: 'chat' | 'profile') => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setPage }) => {
  return (
    <div className="flex flex-col h-full bg-white p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <button onClick={() => setPage('chat')} className="text-gray-600 hover:text-indigo-600 transition">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Профиль {profile.name}</h1>
            <LogOut className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>
        
        <div className="mt-6 space-y-6 overflow-y-auto">
            {/* GOAL & STATUS */}
            <div className="bg-indigo-50 p-4 rounded-xl shadow-lg">
                <div className="flex items-center text-indigo-700">
                    <Target className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Главная цель:</span>
                </div>
                <p className="text-2xl mt-1 font-extrabold text-indigo-900">
                    {profile.goal === 'loss' ? 'Снижение Веса 🔥' : profile.goal === 'gain' ? 'Набор Массы 💪' : 'Поддержание 👌'}
                </p>
                <p className={`mt-2 text-sm font-semibold ${profile.isSubscribed ? 'text-green-600' : 'text-red-500'}`}>
                    Статус: {profile.isSubscribed ? 'PRO-Подписка активна' : 'Базовый план'}
                </p>
            </div>

            {/* MACROS */}
            <div className="grid grid-cols-2 gap-4">
                <ProfileCard icon={<Calendar />} title="Возраст" value={`${profile.age} лет`} />
                <ProfileCard icon={<Clock />} title="Частота питания" value={profile.mealFrequency} />
                <ProfileCard icon={<User />} title="Вес" value={`${profile.weight} кг`} />
                <ProfileCard icon={<Target />} title="Кал / Белки" value={`${profile.targetCalories} ккал / ${profile.targetProtein} г`} />
            </div>

            {/* TARGETS */}
            <h2 className="text-xl font-bold mt-8 text-gray-800 border-b pb-2">Дневные Нормы (КБЖУ)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <TargetStat title="Кал" value={profile.targetCalories} color="text-red-500" />
                <TargetStat title="Белки" value={`${profile.targetProtein} г`} color="text-green-500" />
                <TargetStat title="Жиры" value={`${profile.targetFat} г`} color="text-yellow-500" />
                <TargetStat title="Углеводы" value={`${profile.targetCarbs} г`} color="text-blue-500" />
            </div>
            
            {/* SUBSCRIPTION ACTION */}
            {!profile.isSubscribed && (
                 <button className="w-full mt-6 p-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition">
                    Оформить PRO-подписку
                </button>
            )}
        </div>
    </div>
  );
};


// ====================================================================
// ГЛАВНЫЙ КОМПОНЕНТ (экспортируется Next.js)
// ====================================================================

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile'>('chat');
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [chatHistory, setChatHistory] = useState<Message[]>(mockChatHistory);

  return (
    <div className="flex justify-center items-start w-full min-h-screen bg-gray-200">
      <div className="w-full max-w-xl h-screen shadow-2xl">
        {currentPage === 'chat' 
            ? <ChatView profile={profile} setPage={setCurrentPage} chatHistory={chatHistory} setChatHistory={setChatHistory} /> 
            : <ProfileView profile={profile} setPage={setCurrentPage} />}
      </div>
    </div>
  );
};

export default App;
