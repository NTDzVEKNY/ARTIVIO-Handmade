'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Chat, ChatMessage, Artisan, User } from '@/types';
import type { RawChatDataResponse, RawChatMessage } from '@/types/apiTypes';
import { mapChatDetails, mapToChatMessage } from '@/utils/chatMapper';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function để lấy full URL
const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Nếu đã là link full (ví dụ Cloudinary)
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function ChatPage() {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

    const [chat, setChat] = useState<Chat | null>(null);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Scroll khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // 1. Load dữ liệu ban đầu
    useEffect(() => {
        if (!chatId || Number.isNaN(chatId)) {
            toast.error('ID cuộc trò chuyện không hợp lệ');
            setLoading(false);
            return;
        }

        const loadChatData = async () => {
            try {
                const rawData = await axiosAuth.get<RawChatDataResponse>(`/chat/chatData?chatId=${chatId}`);
                const mappedData = mapChatDetails(rawData.data);
                setChat(mappedData.chat);
                setMessages(mappedData.messages);
                setArtisan(mappedData.artisan);
                setCurrentUser(mappedData.customer);
            } catch (error) {
                toast.error('Có lỗi xảy ra khi tải dữ liệu');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId]);

    // 2. WEBSOCKET SETUP
    useEffect(() => {
        if (!chatId || !session?.user?.apiAccessToken) return;

        const socketUrl = `${API_URL}/ws`;
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            connectHeaders: {
                Authorization: `Bearer ${session.user.apiAccessToken}`,
            },
            onConnect: () => {
                console.log('>>> Connected to WebSocket');
                client.subscribe(`/topic/chat/${chatId}`, (message) => {
                    if (message.body) {
                        try {
                            const rawMsg: RawChatMessage = JSON.parse(message.body);
                            const newMsg = mapToChatMessage(rawMsg, chatId);

                            setMessages((prev) => {
                                const exists = prev.some(m => m.id === newMsg.id);
                                if (exists) return prev;
                                return [...prev, newMsg];
                            });

                            // Thêm setTimeout nhỏ để DOM kịp render trước khi scroll
                            setTimeout(() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        } catch (e) {
                            console.error("Lỗi parse tin nhắn socket:", e);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
                console.log('>>> Disconnected WebSocket');
            }
        };
    }, [chatId, session?.user?.apiAccessToken]);


    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImagePreview = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 3. Gửi tin nhắn
    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || !chat || !currentUser) return;

        setSending(true);

        try {
            const formData = new FormData();
            formData.append('chatId', chatId.toString());
            // Lưu ý: Đảm bảo currentUser.id không null/undefined
            formData.append('senderId', currentUser.id.toString());
            formData.append('senderType', 'CUSTOMER');
            formData.append('content', messageText.trim());

            // Backend có thể tự check file != null, nhưng nếu backend bắt buộc field isImage:
            formData.append('isImage', selectedFile ? 'true' : 'false');

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            // FIX: Xóa headers Content-Type để Axios tự động set boundary
            await axiosAuth.post('/chat/sendMessage', formData);

            // Reset form
            setMessageText('');
            removeImagePreview();

        } catch (error) {
            toast.error('Gửi tin nhắn thất bại');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isChatClosed = chat?.status === 'CLOSED';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-gray-300 rounded-full mb-2"></div>
                <div>Đang tải...</div>
            </div>
        </div>
    );

    if (!chat) return null;

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-140px)]">
                {/* Header Chat */}
                <div className="bg-white border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/custom-request/view/${chat.id}`} className="text-gray-600 hover:text-[#0f172a]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold flex items-center gap-2">
                                    {artisan?.name || 'Nghệ nhân'}
                                    <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">ID: {chatId}</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isChatClosed ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
                                    <span className="text-sm text-gray-600">{isChatClosed ? 'Đã đóng' : 'Đang hoạt động'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Tin Nhắn */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCustomer = message.sender_type === 'CUSTOMER';
                            const isMe = isCustomer && message.sender_id === currentUser?.id;

                            return (
                                <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}>
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-[#0f172a] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                            {message.is_image ? (
                                                <div className="relative w-full min-w-[200px] h-48 rounded-lg overflow-hidden mb-2 bg-gray-300">
                                                    {/* Lưu ý: Check next.config.js domain */}
                                                    <Image
                                                        src={getFullImageUrl(message.content)}
                                                        alt="Message image"
                                                        fill
                                                        className="object-cover"
                                                        onClick={() => window.open(getFullImageUrl(message.content), '_blank')}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(message.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 pt-4 bg-white flex-shrink-0">
                    {isChatClosed ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">Cuộc trò chuyện này đã kết thúc.</div>
                    ) : (
                        <>
                            {imagePreview && (
                                <div className="relative mb-2 inline-block">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    </div>
                                    <button onClick={removeImagePreview} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-500 text-xs shadow-sm">✕</button>
                                </div>
                            )}

                            <div className="flex gap-2 items-end">
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={sending} />
                                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={sending} className="rounded-full shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </Button>

                                <div className="flex-1 relative">
                                    <Input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập tin nhắn..."
                                        disabled={sending}
                                        className="rounded-full pr-10 focus-visible:ring-slate-900"
                                    />
                                </div>

                                <Button type="button" onClick={handleSendMessage} disabled={sending || (!messageText.trim() && !imagePreview)} className="bg-[#0f172a] text-white hover:bg-slate-800 rounded-full w-10 h-10 p-0 shrink-0">
                                    {sending ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}