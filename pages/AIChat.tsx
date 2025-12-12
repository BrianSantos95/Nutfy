import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Componente aprimorado para renderizar texto com formatação de listas e negrito
const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="space-y-2">
            {text.split('\n').map((line, i) => {
                // Identifica se a linha é um item de lista (começa com *, - ou •)
                const isList = line.trim().match(/^[\*\-•]\s/);
                
                // Processa negrito (**texto**)
                const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                if (isList) {
                    return (
                        <div key={i} className="flex gap-2 pl-2">
                            <span className="text-emerald-500 font-bold mt-1">•</span>
                            <span className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed">
                                {parts.map((p, idx) => (typeof p === 'string' ? p.replace(/^[\*\-•]\s/, '') : p))}
                            </span>
                        </div>
                    );
                }

                if (!line.trim()) return <div key={i} className="h-2"></div>;

                return <div key={i} className="text-slate-800 dark:text-slate-200 leading-relaxed">{parts}</div>;
            })}
        </div>
    );
};

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializa o chat APENAS se a chave estiver presente e quando o componente monta.
  // Utiliza um ref para persistir a instância do chat durante a sessão do componente.
  const chatSessionRef = useRef<Chat | null>(null);

  const initializeChat = () => {
    if (!process.env.API_KEY) {
      console.error("API Key not found");
      return null;
    }
    
    if (!chatSessionRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `
                    Você é um assistente especializado APENAS em nutrição, alimentação e composição de alimentos para nutricionistas.
                    
                    REGRAS DE FORMATAÇÃO (MUITO IMPORTANTE):
                    1. Use SEMPRE listas com marcadores (• ou -) para organizar opções, ingredientes ou passos.
                    2. Nunca responda com blocos grandes de texto corrido. Quebre em parágrafos curtos ou listas.
                    3. Use **negrito** para destacar alimentos, quantidades ou valores calóricos.
                    4. Seja direto e prático.

                    REGRAS RÍGIDAS DE ESCOPO:
                    1. Responda EXCLUSIVAMENTE sobre: composição de alimentos, substituições alimentares, dúvidas sobre calorias/macros, ideias de refeições saudáveis e boas práticas básicas de dieta.
                    2. RECUSE AUTOMATICAMENTE qualquer pergunta sobre: treinos, exercícios físicos, diagnósticos médicos, tratamento de doenças, medicamentos, suplementação hormonal ou avançada, e assuntos não relacionados a comida.
                    3. Se a pergunta for fora do escopo permitido, responda EXATAMENTE: "Desculpe, este chat responde apenas dúvidas rápidas sobre alimentação, nutrição e substituições alimentares."
                `,
            }
        });
    }
    return chatSessionRef.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const chat = initializeChat();
    if (!chat) {
        alert("Erro de configuração da IA. Verifique a chave de API.");
        return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message: userMsg });
        const text = response.text || "Sem resposta.";
        
        setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
        console.error("Erro na IA:", error);
        setMessages(prev => [...prev, { role: 'model', text: "Erro ao processar sua dúvida. Tente novamente." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout title="Chat IA: Dúvidas Rápidas">
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] flex flex-col pb-20 md:pb-0">
        
        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
            
            {/* Header / Info Bar */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-md shadow-pink-200 dark:shadow-none">
                    <Sparkles size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Assistente de Nutrição</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Responde em tópicos sobre alimentação.</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60 px-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bot size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Como posso ajudar?</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-2">
                            Tire dúvidas rápidas sobre valor nutricional, substituições de alimentos ou ideias para o cardápio.
                        </p>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                            <button onClick={() => setInput("Opções de café da manhã sem glúten")} className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors text-slate-600 dark:text-slate-400">
                                "Opções de café da manhã sem glúten"
                            </button>
                            <button onClick={() => setInput("Alimentos ricos em ferro vegetal")} className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors text-slate-600 dark:text-slate-400">
                                "Alimentos ricos em ferro vegetal"
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`px-5 py-4 rounded-2xl text-sm shadow-sm ${
                                msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                            }`}>
                                <MessageContent text={msg.text} />
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[70%]">
                             <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-1 text-slate-500">
                                <Bot size={16} />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 className="animate-spin w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-500">Analisando...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua dúvida rápida sobre alimentação..."
                        disabled={isLoading}
                        className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white p-3 rounded-xl transition-all shadow-md shadow-emerald-200 dark:shadow-none active:scale-95 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </Layout>
  );
};