import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="space-y-2">
            {text.split('\n').map((line, i) => {
                const isList = line.trim().match(/^[\*\-•]\s/);
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
    const chatSessionRef = useRef<Chat | null>(null);

    const initializeChat = () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("VITE_GEMINI_API_KEY não encontrada no arquivo .env");
            return null;
        }

        if (!chatSessionRef.current) {
            const ai = new GoogleGenAI({
                apiKey,
            });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.0-flash',
                config: {
                    systemInstruction: `
                    Você é um assistente especializado em nutrição clínica.
                    Responda sempre de forma técnica porém acessível.
                    Use listas e negritos para facilitar a leitura.
                    Foque em: substituições, macros, micronutrientes e ideias de cardápio.
                    Se perguntarem sobre doenças graves ou medicamentos, sugira sempre a consulta médica presencial.
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
        if (!input.trim() || isLoading) return;

        const chat = initializeChat();
        if (!chat) {
            alert("Erro de autenticação com o serviço de IA.");
            return;
        }

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: userMsg });
            const text = response.text || "Desculpe, não consegui processar sua dúvida agora.";
            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Ocorreu um erro na comunicação com a inteligência artificial. Tente novamente em instantes." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout title="Assistente Nutricional IA">
            <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

                    <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="bg-emerald-500 p-2 rounded-xl text-white">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Nutri Helper Pro</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Suporte técnico em tempo real</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                <Bot size={48} className="text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Como posso ajudar em seus atendimentos?</h3>
                                <p className="text-sm text-slate-500 max-w-sm mt-2">Peça sugestões de substituições, cálculos de macros ou ideias de receitas saudáveis.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`px-5 py-4 rounded-2xl text-sm ${msg.role === 'user'
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
                                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl flex items-center gap-2">
                                    <Loader2 className="animate-spin w-4 h-4 text-emerald-500" />
                                    <span className="text-xs text-slate-500">Nutri Helper está pensando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ex: Sugira 3 substituições para o pão francês no café da manhã"
                                disabled={isLoading}
                                className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};