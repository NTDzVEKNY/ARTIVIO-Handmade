'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast'; // Đảm bảo Toaster được đặt ở Layout hoặc Root
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Send,
    Image as ImageIcon,
    X,
    Loader2,
    User,
    MapPin,
    Mail
} from 'lucide-react';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Chat, ChatMessage, User as UserType } from '@/types';
import type { RawChatDataResponse, RawChatMessage } from '@/types/apiTypes';
import { mapChatDetails, mapToChatMessage } from '@/utils/chatMapper';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- CONFIGURATION & HELPERS ---
const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return 'Thỏa thuận';
    const num = Number(amount);
    if (isNaN(num)) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// Theme constants để tái sử dụng
const THEME = {
    textPrimary: '#3F2E23',
    textSecondary: '#6B4F3E',
    border: '#E8D5B5',
    bgLight: '#FFF8F0',
    bgWhite: '#ffffff',
};

export default function AdminChatDetailPage() {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const router = useRouter();
    const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

    const [chat, setChat] = useState<Chat | null>(null);
    const [customer, setCustomer] = useState<UserType | null>(null);
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
                const rawData = await axiosAuth.get<RawChatDataResponse>(`/chat/chatData?chatId=${chatId}`);
                const mappedData = mapChatDetails(rawData.data);

                setChat(mappedData.chat);
                setMessages(mappedData.messages);
                setCustomer(mappedData.customer);
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
            if (client.active) client.deactivate();
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

    // 3. Gửi tin nhắn
    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || !chat || !session?.user) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('chatId', chatId.toString());
            // Lưu ý: ID sender và type cần map đúng với logic backend của bạn
            formData.append('senderId', '1');
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

    // --- RENDER ---

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-2" style={{ color: THEME.textSecondary }}>
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Đang tải cuộc hội thoại...</p>
        </div>
    );

    if (!chat) return <div className="p-4" style={{ color: THEME.textPrimary }}>Không tìm thấy cuộc trò chuyện.</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]" style={{ backgroundColor: THEME.bgWhite }}>
            {/* --- HEADER --- */}
            <div
                className="flex items-center justify-between border-b px-6 py-4 shadow-sm flex-shrink-0 z-10"
                style={{ backgroundColor: THEME.bgWhite, borderColor: THEME.border }}
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/admin/chat')}
                        className="rounded-full hover:bg-[#FFF8F0]"
                        style={{ borderColor: THEME.border, color: THEME.textPrimary }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-bold text-xl" style={{ color: THEME.textPrimary }}>
                                {customer?.name || 'Khách hàng'}
                            </h1>
                            <Badge
                                variant="outline"
                                style={{ borderColor: THEME.border, color: THEME.textSecondary }}
                            >
                                #{chatId}
                            </Badge>
                            {isChatClosed && (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-transparent">
                                    Đã kết thúc
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: THEME.textSecondary }}>
                            {chat.title}
                        </p>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                    <p className="text-xs uppercase tracking-wide" style={{ color: THEME.textSecondary }}>Ngân sách dự kiến</p>
                    <p className="text-lg font-bold" style={{ color: THEME.textPrimary }}>{formatCurrency(chat.budget)}</p>
                </div>
            </div>

            {/* --- BODY (FLEX LAYOUT) --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: MAIN CHAT AREA */}
                <div className="flex-1 flex flex-col relative bg-white">

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* 1. Request Info Block (Styled like Orders) */}
                        <div
                            className="mx-auto max-w-3xl rounded-xl border p-4 shadow-sm mb-8"
                            style={{
                                backgroundColor: THEME.bgLight,
                                borderColor: THEME.border
                            }}
                        >
                            <div className="flex gap-4">
                                {hasReferenceImage && (
                                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border" style={{ borderColor: THEME.border }}>
                                        <Image
                                            src={getFullImageUrl(chat.reference_image)}
                                            alt="Reference"
                                            fill
                                            className="object-cover cursor-pointer hover:scale-105 transition"
                                            onClick={() => window.open(getFullImageUrl(chat.reference_image), '_blank')}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm uppercase mb-2" style={{ color: THEME.textSecondary }}>
                                        Yêu cầu thiết kế
                                    </h3>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: THEME.textPrimary }}>
                                        {chat.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Messages */}
                        {messages.length === 0 ? (
                            <div className="text-center py-10" style={{ color: THEME.textSecondary }}>
                                <p>Chưa có tin nhắn nào. Hãy bắt đầu trao đổi!</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isMe = message.sender_type === 'ARTISAN';

                                return (
                                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>

                                            {/* Avatar logic if needed, simplify for now */}
                                            <div className="flex items-end gap-2">
                                                {!isMe && (
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 shrink-0"
                                                        style={{ backgroundColor: THEME.bgLight, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }}
                                                    >
                                                        {customer?.name?.charAt(0) || 'C'}
                                                    </div>
                                                )}

                                                {/* Message Bubble */}
                                                <div
                                                    className={`rounded-2xl px-5 py-3 shadow-sm text-sm transition-all
                                                        ${isMe
                                                        ? 'rounded-br-sm text-white' // Admin Styles
                                                        : 'rounded-bl-sm' // Customer Styles
                                                    }`}
                                                    style={isMe
                                                        ? { backgroundColor: THEME.textPrimary }
                                                        : { backgroundColor: THEME.bgLight, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }
                                                    }
                                                >
                                                    {message.is_image ? (
                                                        <div className="relative w-full min-w-[200px] max-w-[300px] h-60 rounded-lg overflow-hidden my-1 bg-white/10">
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

                                            {/* Timestamp */}
                                            <span
                                                className="text-[10px] mt-1 px-11 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: THEME.textSecondary }}
                                            >
                                                {new Date(message.created_at).toLocaleTimeString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        className="p-4 border-t"
                        style={{ backgroundColor: THEME.bgWhite, borderColor: THEME.border }}
                    >
                        {isChatClosed ? (
                            <div className="bg-gray-100 p-3 rounded text-center text-sm text-gray-500">
                                Phiên trò chuyện này đã kết thúc.
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {imagePreview && (
                                    <div className="relative mb-3 inline-block">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border shadow-sm" style={{ borderColor: THEME.border }}>
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                        <button
                                            onClick={removeImagePreview}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md transition"
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
                                        className="rounded-full shrink-0 hover:bg-[#FFF8F0]"
                                        style={{ borderColor: THEME.border, color: THEME.textSecondary }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={sending}
                                    >
                                        <ImageIcon size={20} />
                                    </Button>

                                    <div className="flex-1">
                                        <Input
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn..."
                                            disabled={sending}
                                            className="rounded-full focus-visible:ring-offset-0"
                                            style={{
                                                backgroundColor: THEME.bgLight,
                                                borderColor: THEME.border,
                                                color: THEME.textPrimary
                                            }}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={sending || (!messageText.trim() && !imagePreview)}
                                        className="rounded-full w-10 h-10 p-0 shrink-0 shadow-sm"
                                        style={{ backgroundColor: THEME.textPrimary }}
                                    >
                                        {sending ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                                        ) : (
                                            <Send size={18} className="text-white ml-0.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: SIDEBAR INFO (Desktop Only) */}
                <div
                    className="w-80 border-l p-6 hidden xl:block overflow-y-auto"
                    style={{
                        backgroundColor: THEME.bgWhite,
                        borderColor: THEME.border
                    }}
                >
                    <h3 className="font-bold mb-6 text-lg" style={{ color: THEME.textPrimary }}>Thông tin chi tiết</h3>

                    <div className="space-y-6">
                        {/* Customer Card */}
                        <div
                            className="rounded-xl border p-4"
                            style={{ backgroundColor: THEME.bgLight, borderColor: THEME.border }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ backgroundColor: THEME.textSecondary }}
                                >
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: THEME.textPrimary }}>{customer?.fullName}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border" style={{ borderColor: THEME.border, color: THEME.textSecondary }}>
                                        Khách hàng
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex items-center gap-2" style={{ color: THEME.textSecondary }}>
                                    <Mail size={14} />
                                    <span className="truncate">{customer?.email}</span>
                                </div>
                                <div className="flex items-center gap-2" style={{ color: THEME.textSecondary }}>
                                    <MapPin size={14} />
                                    <span>Việt Nam</span>
                                </div>
                            </div>
                        </div>

                        <Separator style={{ backgroundColor: THEME.border }} />

                        {/* Order Details Mini */}
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: THEME.textSecondary }}>
                                Tóm tắt yêu cầu
                            </span>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: THEME.textSecondary }}>Mã yêu cầu</span>
                                    <span className="font-medium" style={{ color: THEME.textPrimary }}>#{chatId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: THEME.textSecondary }}>Ngân sách</span>
                                    <span className="font-bold" style={{ color: '#16a34a' }}>{formatCurrency(chat.budget)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: THEME.textSecondary }}>Ngày tạo</span>
                                    <span style={{ color: THEME.textPrimary }}>
                                        {chat.created_at ? new Date(chat.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t" style={{ borderColor: THEME.border }}>
                            <Button variant="outline" className="w-full justify-start" style={{ color: THEME.textPrimary, borderColor: THEME.border }}>
                                <span className="mr-2">📄</span> Tạo đơn hàng từ Chat
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}