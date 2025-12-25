'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Image as ImageIcon, X, Paperclip } from 'lucide-react'; // Sử dụng Lucide React icon có sẵn trong Shadcn

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Chat, ChatMessage, Artisan, User } from '@/types';
import type { RawChatDataResponse, RawChatMessage } from '@/types/apiTypes';
import { mapChatDetails, mapToChatMessage } from '@/utils/chatMapper';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function để lấy full URL
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Helper format tiền tệ
const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return 'Thỏa thuận';
    const num = Number(amount);
    if (isNaN(num)) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function AdminChatDetailPage() {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const router = useRouter();
    const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

    const [chat, setChat] = useState<Chat | null>(null);
    const [customer, setCustomer] = useState<User | null>(null); // Người Admin đang chat cùng
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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // 1. Fetch dữ liệu ban đầu
    useEffect(() => {
        if (!chatId || Number.isNaN(chatId)) {
            toast.error('ID cuộc trò chuyện không hợp lệ');
            router.push('/admin/chat');
            return;
        }

        const loadChatData = async () => {
            try {
                // Admin vẫn gọi API giống user để lấy data, tuy nhiên cần quyền Admin để gọi
                const rawData = await axiosAuth.get<RawChatDataResponse>(`/chat/chatData?chatId=${chatId}`);
                const mappedData = mapChatDetails(rawData.data);

                setChat(mappedData.chat);
                setMessages(mappedData.messages);
                setCustomer(mappedData.customer); // Đối với Admin, đối tượng quan tâm là Customer
            } catch (error) {
                toast.error('Không thể tải dữ liệu cuộc trò chuyện');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId, axiosAuth, router]);

    // 2. Kết nối WebSocket
    useEffect(() => {
        if (!chatId || !session?.user?.apiAccessToken) return;

        const socketUrl = `${API_URL}/ws`;
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            connectHeaders: { Authorization: `Bearer ${session.user.apiAccessToken}` },
            onConnect: () => {
                console.log('>>> Admin Connected to WebSocket');
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
            }
        };
    }, [chatId, session?.user?.apiAccessToken]);

    // Xử lý chọn ảnh
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

    // 3. Gửi tin nhắn (Với vai trò ADMIN)
    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || !chat || !session?.user) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('chatId', chatId.toString());
            formData.append('senderId', 1);
            formData.append('senderType', 'ARTISAN');
            formData.append('content', messageText.trim());
            formData.append('isImage', selectedFile ? 'true' : 'false');
            if (selectedFile) formData.append('file', selectedFile);

            await axiosAuth.post('/chat/sendMessage', formData);
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
    const hasReferenceImage = !!chat?.reference_image;

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    if (!chat) return <div className="p-4">Không tìm thấy cuộc trò chuyện.</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50">
            {/* --- HEADER --- */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/chat')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                {customer?.name || 'Khách hàng'}
                                <Badge variant="outline" className="font-normal text-xs text-slate-500">
                                    #{chatId}
                                </Badge>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium">{chat.title}</span>
                            <span>•</span>
                            <span className={isChatClosed ? "text-red-500" : "text-green-600 font-medium"}>
                                {isChatClosed ? 'Đã đóng' : 'Đang hoạt động'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin nhanh về ngân sách */}
                <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Ngân sách mong muốn</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(chat.budget)}</p>
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col relative">

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {/* Hiển thị thông tin yêu cầu ở đầu đoạn chat để Admin nắm bắt */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 mx-auto max-w-3xl">
                            <div className="flex gap-4">
                                {hasReferenceImage && (
                                    <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden border border-blue-200">
                                        <Image
                                            src={getFullImageUrl(chat.reference_image)}
                                            alt="Ref"
                                            fill
                                            className="object-cover cursor-pointer hover:scale-110 transition"
                                            onClick={() => window.open(getFullImageUrl(chat.reference_image), '_blank')}
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Yêu cầu từ khách hàng</h3>
                                    <p className="text-sm text-blue-800/80 whitespace-pre-wrap">{chat.description}</p>
                                </div>
                            </div>
                        </div>

                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 py-10">Chưa có tin nhắn nào.</div>
                        ) : (
                            messages.map((message) => {
                                // Logic xác định là tin nhắn của Admin hay Customer
                                const isMe = message.sender_type === 'ARTISAN';

                                return (
                                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[60%]`}>
                                            <div className="flex items-end gap-2">
                                                {!isMe && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mb-1">
                                                        {customer?.name?.charAt(0) || 'C'}
                                                    </div>
                                                )}

                                                <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm 
                                                    ${isMe
                                                    ? 'bg-slate-900 text-white rounded-br-none'
                                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                                }`}>

                                                    {message.is_image ? (
                                                        <div className="relative w-full min-w-[200px] h-56 rounded-lg overflow-hidden my-1 bg-slate-100">
                                                            <Image
                                                                src={getFullImageUrl(message.content)}
                                                                alt="Sent image"
                                                                fill
                                                                className="object-cover hover:scale-105 transition duration-300 cursor-pointer"
                                                                onClick={() => window.open(getFullImageUrl(message.content), '_blank')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 px-9 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {new Date(message.created_at).toLocaleTimeString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {!isMe && ` • ${customer?.name}`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t">
                        {isChatClosed ? (
                            <div className="bg-slate-100 text-slate-500 p-3 rounded text-center text-sm">
                                Phiên trò chuyện này đã kết thúc.
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {imagePreview && (
                                    <div className="relative mb-3 inline-block">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                        <button
                                            onClick={removeImagePreview}
                                            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center hover:bg-red-500 shadow-sm"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-3 items-end">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        disabled={sending}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full shrink-0 text-slate-500 hover:text-slate-700"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={sending}
                                    >
                                        <ImageIcon size={20} />
                                    </Button>

                                    <div className="flex-1 relative">
                                        <Input
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn với tư cách Quản trị viên..."
                                            disabled={sending}
                                            className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-slate-900 pr-4"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={sending || (!messageText.trim() && !imagePreview)}
                                        className="rounded-full w-10 h-10 p-0 shrink-0 bg-slate-900 hover:bg-slate-800"
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send size={18} className="ml-0.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (Optional - Thông tin chi tiết hơn) */}
                <div className="w-80 border-l bg-white p-4 hidden xl:block overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-4">Chi tiết yêu cầu</h3>

                    <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                            <span className="text-xs text-slate-500 block mb-1">Khách hàng</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {customer?.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{customer?.fullName}</p>
                                    <p className="text-xs text-slate-500">{customer?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mô tả</span>
                            <p className="text-sm mt-1 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                                {chat.description || 'Không có mô tả'}
                            </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-slate-500">Ngân sách</span>
                                <p className="font-semibold text-green-600">{formatCurrency(chat.budget)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Trạng thái</span>
                                <Badge variant={isChatClosed ? "secondary" : "default"} className="mt-1">
                                    {isChatClosed ? "Closed" : "Active"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}