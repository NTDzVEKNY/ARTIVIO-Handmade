'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    ArrowLeft,
    Send,
    Image as ImageIcon,
    X,
    Loader2,
    User,
    MapPin,
    Mail,
    FileText,
    DollarSign,
    Calendar,
    Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { Chat, ChatMessage, User as UserType } from '@/types';
import type { RawChatDataResponse, RawChatMessage } from '@/types/apiTypes';
import { mapChatDetails, mapToChatMessage } from '@/utils/chatMapper';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- HELPER FUNCTIONS ---
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

export default function AdminChatDetailPage() {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const router = useRouter();
    const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

    // --- STATE ---
    const [chat, setChat] = useState<Chat | null>(null);
    const [customer, setCustomer] = useState<UserType | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [messageText, setMessageText] = useState('');

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- STATE FOR PROPOSAL MODAL ---
    const [isProposalOpen, setIsProposalOpen] = useState(false);
    const [proposalPrice, setProposalPrice] = useState<string>('');
    const [proposalNote, setProposalNote] = useState('');

    // --- REFS ---
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const stompClientRef = useRef<Client | null>(null);

    // --- SCROLL TO BOTTOM ---
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // --- 1. FETCH DATA (Updated to match ProductsPage pattern) ---
    const fetchChatData = useCallback(async () => {
        if (!chatId || Number.isNaN(chatId)) {
            toast.error('ID cuộc trò chuyện không hợp lệ');
            router.push('/admin/chat');
            return;
        }

        try {
            setIsLoading(true);
            const rawData = await axiosAuth.get<RawChatDataResponse>(`/chat/chatData?chatId=${chatId}`);
            const mappedData = mapChatDetails(rawData.data);

            setChat(mappedData.chat);
            setMessages(mappedData.messages);
            setCustomer(mappedData.customer);
        } catch (error) {
            toast.error('Không thể tải dữ liệu cuộc trò chuyện');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [chatId, axiosAuth, router]);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);

    // --- 2. WEBSOCKET CONNECTION ---
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

    // --- HANDLERS ---
    const handleSendProposal = async () => {
        if (!proposalPrice || isNaN(Number(proposalPrice))) {
            toast.error("Vui lòng nhập giá hợp lệ");
            return;
        }

        setIsSending(true);
        try {
            // Create JSON content for the proposal
            const proposalData = JSON.stringify({
                price: Number(proposalPrice),
                title: chat?.title || "Đơn hàng tùy chỉnh",
                description: proposalNote || chat?.description || ""
            });

            const customProduct = await axiosAuth.post('/products', {
                productName: chat?.title || "Đơn hàng tùy chỉnh",
                price : Number(proposalPrice),
                description: proposalNote || chat?.description || "",
                status : "HIDDEN",
                stockQuantity : 20,
                categoryId : 99999999,
                image: chat?.reference_image || null
            });

            const formData = new FormData();
            formData.append('chatId', chatId.toString());
            formData.append('senderId', '1'); // Or get from session
            formData.append('senderType', 'ARTISAN');
            formData.append('content', JSON.stringify(customProduct.data)); // Send JSON string
            formData.append('isImage', 'false');
            formData.append('type', 'ORDER_PROPOSAL'); // <--- IMPORTANT: Send type

            await axiosAuth.post('/chat/sendMessage', formData);

            toast.success("Đã gửi đề xuất đơn hàng!");
            setIsProposalOpen(false);
            setProposalPrice('');
            setProposalNote('');
        } catch (error) {
            toast.error('Gửi đề xuất thất bại');
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

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

    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || !chat || !session?.user) return;
        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('chatId', chatId.toString());
            formData.append('senderId', '1'); // Check logic này với Backend
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
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // --- RENDER ---

    // 1. Loading State (Matching ProductsPage style)
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#ffffff]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F2E23] mx-auto"></div>
                    <p className="mt-4 text-[#6B4F3E]">Đang tải cuộc hội thoại...</p>
                </div>
            </div>
        );
    }

    if (!chat) return <div className="p-8 text-center text-[#3F2E23]">Không tìm thấy cuộc trò chuyện.</div>;

    const isChatClosed = chat.status === 'CLOSED';
    const hasReferenceImage = !!chat.reference_image;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between border-b border-[#E8D5B5] px-6 py-4 shadow-sm flex-shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/admin/chat')}
                        className="rounded-full border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0] hover:text-[#3F2E23]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-bold text-xl text-[#3F2E23]">
                                {customer?.name || 'Khách hàng'}
                            </h1>
                            <Badge
                                variant="outline"
                                className="border-[#E8D5B5] text-[#6B4F3E] bg-[#FFF8F0]"
                            >
                                #{chatId}
                            </Badge>
                            {isChatClosed && (
                                <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                                    Đã kết thúc
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm mt-0.5 text-[#6B4F3E]">
                            {chat.title}
                        </p>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                    <p className="text-xs uppercase tracking-wide text-[#6B4F3E]">Ngân sách dự kiến</p>
                    <p className="text-lg font-bold text-[#3F2E23]">{formatCurrency(chat.budget)}</p>
                </div>
            </div>

            {/* --- MAIN CONTENT (FLEX) --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: CHAT AREA */}
                <div className="flex-1 flex flex-col relative bg-white">

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* 1. Request Info Block (Pinned Top) */}
                        <div className="mx-auto max-w-3xl rounded-xl border border-[#E8D5B5] p-4 shadow-sm bg-[#FFF8F0] mb-8">
                            <div className="flex gap-4">
                                {hasReferenceImage && (
                                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[#E8D5B5] bg-white">
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
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText size={16} className="text-[#6B4F3E]" />
                                        <h3 className="font-semibold text-sm uppercase text-[#6B4F3E]">
                                            Yêu cầu thiết kế
                                        </h3>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-[#3F2E23]">
                                        {chat.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Chat Bubbles */}
                        {messages.length === 0 ? (
                            <div className="text-center py-10 text-[#6B4F3E] opacity-70">
                                <p>Chưa có tin nhắn nào. Hãy bắt đầu trao đổi!</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isMe = message.sender_type === 'ARTISAN';
                                return (
                                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                                            <div className="flex items-end gap-2">
                                                {/* Customer Avatar */}
                                                {!isMe && (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 shrink-0 bg-[#FFF8F0] text-[#3F2E23] border border-[#E8D5B5]">
                                                        {customer?.name?.charAt(0) || 'C'}
                                                    </div>
                                                )}

                                                {/* Bubble */}
                                                <div
                                                    className={`rounded-2xl px-5 py-3 shadow-sm text-sm transition-all
                                                        ${isMe
                                                        ? 'bg-[#3F2E23] text-white rounded-br-none'
                                                        : 'bg-[#FFF8F0] text-[#3F2E23] border border-[#E8D5B5] rounded-bl-none'
                                                    }`}
                                                >
                                                    {message.is_image ? (
                                                        <div className="relative w-full min-w-[200px] max-w-[300px] h-60 rounded-lg overflow-hidden my-1 bg-black/5">
                                                            <Image
                                                                src={getFullImageUrl(message.content)}
                                                                alt="Sent image"
                                                                fill
                                                                className="object-cover hover:scale-105 transition duration-300 cursor-pointer"
                                                                onClick={() => window.open(getFullImageUrl(message.content), '_blank')}
                                                            />
                                                        </div>
                                                    ) : message.type === 'ORDER_PROPOSAL' ? (
                                                        (() => {
                                                            // --- HÀM XỬ LÝ AN TOÀN ---
                                                            const safeParseJSON = (str) => {
                                                                if (typeof str === 'object' && str !== null) return str; // Nếu đã là object thì trả về luôn
                                                                if (!str) return {};

                                                                let cleaned = str.trim();
                                                                // 1. Thêm ngoặc nhọn nếu thiếu
                                                                if (!cleaned.startsWith('{')) cleaned = `{${cleaned}}`;

                                                                try {
                                                                    // Thử parse chuẩn trước
                                                                    return JSON.parse(cleaned);
                                                                } catch (e1) {
                                                                    try {
                                                                        // 2. Nếu lỗi, thử "sửa" lỗi thiếu ngoặc kép ở Key (ví dụ: id:123 -> "id":123)
                                                                        // Regex này tìm các key chưa có ngoặc kép và thêm vào
                                                                        const fixedJSON = cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
                                                                        return JSON.parse(fixedJSON);
                                                                    } catch (e2) {
                                                                        console.error("Vẫn lỗi parse:", e2, "Chuỗi gốc:", str);
                                                                        return null;
                                                                    }
                                                                }
                                                            };

                                                            const productData = safeParseJSON(message.content);

                                                            // Nếu không parse được hoặc dữ liệu rỗng
                                                            if (!productData) {
                                                                return <div className="text-red-500 text-xs p-2 border border-red-200 bg-red-50 rounded">Lỗi dữ liệu đơn hàng</div>;
                                                            }

                                                            return (
                                                                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm max-w-sm my-1">
                                                                    <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                                                                        <span className="text-blue-500 text-lg">🛍️</span>
                                                                        <span className="font-semibold text-sm text-gray-700 uppercase">Đơn đề xuất</span>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-bold text-gray-800 text-base leading-tight">
                                                                            {productData.productName || 'Sản phẩm'}
                                                                        </h3>
                                                                        <div className="flex justify-between items-center">
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {productData.categoryName || 'Khác'}
                        </span>
                                                                            <span className="font-bold text-blue-600 text-lg">
                            {productData.price ? Number(productData.price).toLocaleString('vi-VN') : 0} đ
                        </span>
                                                                        </div>
                                                                        {productData.description && (
                                                                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded mt-2 italic">
                                                                                "{productData.description}"
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <span className="text-[10px] mt-1 px-11 opacity-0 group-hover:opacity-100 transition-opacity text-[#6B4F3E]">
                                                {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#E8D5B5] bg-white">
                        {isChatClosed ? (
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                                <X size={16} /> Phiên trò chuyện này đã kết thúc.
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {imagePreview && (
                                    <div className="relative mb-3 inline-block animate-in fade-in zoom-in duration-200">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E8D5B5] shadow-sm">
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
                                        disabled={isSending}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full shrink-0 border-[#E8D5B5] text-[#6B4F3E] hover:bg-[#FFF8F0] hover:text-[#3F2E23]"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSending}
                                    >
                                        <ImageIcon size={20} />
                                    </Button>

                                    <div className="flex-1">
                                        <Input
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn..."
                                            disabled={isSending}
                                            className="rounded-full bg-[#FFF8F0] border-[#E8D5B5] text-[#3F2E23] placeholder:text-[#6B4F3E]/60 focus-visible:ring-[#3F2E23] focus-visible:ring-offset-0"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={isSending || (!messageText.trim() && !imagePreview)}
                                        className="rounded-full w-10 h-10 p-0 shrink-0 shadow-sm bg-[#3F2E23] hover:bg-[#2A1E17] text-white transition-colors"
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send size={18} className="ml-0.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: SIDEBAR INFO (Desktop Only) */}
                <div className="w-80 border-l border-[#E8D5B5] p-6 hidden xl:block overflow-y-auto bg-white">
                    <h3 className="font-bold mb-6 text-lg text-[#3F2E23]">Thông tin chi tiết</h3>

                    <div className="space-y-6">
                        {/* Customer Card */}
                        <div className="rounded-xl border border-[#E8D5B5] p-4 bg-[#FFF8F0]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-[#6B4F3E]">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#3F2E23]">{customer?.fullName}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#E8D5B5] text-[#6B4F3E]">
                                        Khách hàng
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex items-center gap-2 text-[#6B4F3E]">
                                    <Mail size={14} />
                                    <span className="truncate">{customer?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#6B4F3E]">
                                    <MapPin size={14} />
                                    <span>Việt Nam</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-[#E8D5B5]" />

                        {/* Order Details Mini */}
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider block mb-3 text-[#6B4F3E]">
                                Tóm tắt yêu cầu
                            </span>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B4F3E] flex items-center gap-1"><FileText size={14}/> Mã yêu cầu</span>
                                    <span className="font-medium text-[#3F2E23]">#{chatId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B4F3E] flex items-center gap-1"><DollarSign size={14}/> Ngân sách</span>
                                    <span className="font-bold text-green-700">{formatCurrency(chat.budget)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B4F3E] flex items-center gap-1"><Calendar size={14}/> Ngày tạo</span>
                                    <span className="text-[#3F2E23]">
                                        {chat.created_at ? new Date(chat.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#E8D5B5]">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Pre-fill price from budget if available
                                    if (chat?.budget) setProposalPrice(chat.budget.toString());
                                    setIsProposalOpen(true);
                                }}
                                className="w-full justify-start border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
                            >
                                <span className="mr-2">📄</span> Tạo đơn hàng từ Chat
                            </Button>
                        </div>
                    </div>
                </div>
                {/* --- MODAL POPUP (ADD THIS AT THE END OF RETURN) --- */}
                {isProposalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-[#E8D5B5] animate-in fade-in zoom-in-95 duration-200">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-[#E8D5B5]">
                                <h3 className="font-bold text-[#3F2E23]">Tạo Đề Xuất Đơn Hàng</h3>
                                <button onClick={() => setIsProposalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#6B4F3E]">Giá chốt (VNĐ)</label>
                                    <Input
                                        type="number"
                                        value={proposalPrice}
                                        onChange={(e) => setProposalPrice(e.target.value)}
                                        placeholder="Ví dụ: 500000"
                                        className="border-[#E8D5B5] focus-visible:ring-[#3F2E23]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#6B4F3E]">Ghi chú (Tên SP/Chi tiết)</label>
                                    <Input
                                        value={proposalNote}
                                        onChange={(e) => setProposalNote(e.target.value)}
                                        placeholder="VD: Lọ hoa gốm xanh custom..."
                                        className="border-[#E8D5B5] focus-visible:ring-[#3F2E23]"
                                    />
                                </div>

                                <div className="bg-[#FFF8F0] p-3 rounded-lg text-xs text-[#6B4F3E]">
                                    <p>ℹ️ Khách hàng sẽ nhận được tin nhắn xác nhận. Đơn hàng chỉ được tạo chính thức khi khách hàng nhấn nút <b>"Đồng ý & Thanh toán"</b>.</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-[#E8D5B5] flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsProposalOpen(false)}
                                    disabled={isSending}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSendProposal}
                                    disabled={isSending}
                                    className="bg-[#3F2E23] hover:bg-[#2A1E17] text-white"
                                >
                                    {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="w-4 h-4 mr-2" />}
                                    Gửi đề xuất
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}