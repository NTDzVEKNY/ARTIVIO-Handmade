'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    getChatById,
    getChatMessages,
    sendMessage,
    getArtisanById,
    getCurrentUser,
    initializeMockChat,
} from '@/services/customRequestApi';
import type { Chat, Message, Artisan, User } from '@/types';

export default function ChatPage() {
    const params = useParams();
    // const router = useRouter(); // Chưa dùng đến, có thể bỏ
    const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

    const [chat, setChat] = useState<Chat | null>(null);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');

    // Tách biệt giữa file thực tế để gửi và chuỗi preview để hiển thị
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Hàm scroll xuống dưới cùng (dùng useCallback để tái sử dụng)
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // 2. Load dữ liệu ban đầu
    useEffect(() => {
        if (!chatId || Number.isNaN(chatId)) {
            toast.error('ID cuộc trò chuyện không hợp lệ');
            setLoading(false);
            return;
        }

        const loadChatData = async () => {
            try {
                const [chatData, userData] = await Promise.all([
                    getChatById(chatId),
                    getCurrentUser(),
                ]);

                if (!chatData) {
                    toast.error('Không tìm thấy cuộc trò chuyện');
                    return;
                }

                setChat(chatData);
                setCurrentUser(userData);

                // Load artisan info
                if (chatData.artisan_id) {
                    const artisanData = await getArtisanById(chatData.artisan_id);
                    setArtisan(artisanData);
                }

                // Lấy tin nhắn lần đầu
                let msgs = await getChatMessages(chatId);

                // Mock data logic (nếu cần)
                if (msgs.length === 0) {
                    await initializeMockChat(chatId); // Cẩn thận hàm này nếu chạy production
                    msgs = await getChatMessages(chatId);
                }
                setMessages(msgs);

            } catch (error) {
                toast.error('Có lỗi xảy ra khi tải dữ liệu');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId]);

    // 3. Polling: Tự động cập nhật tin nhắn mỗi 3 giây
    useEffect(() => {
        if (!chatId || isChatClosed) return;

        const intervalId = setInterval(async () => {
            try {
                const latestMessages = await getChatMessages(chatId);
                // Chỉ cập nhật nếu số lượng tin nhắn thay đổi để tránh re-render thừa
                setMessages((prev) => {
                    if (prev.length !== latestMessages.length) {
                        return latestMessages;
                    }
                    return prev;
                });
            } catch (error) {
                console.error("Lỗi polling tin nhắn:", error);
            }
        }, 3000); // 3 giây request 1 lần

        return () => clearInterval(intervalId);
    }, [chatId, chat?.status]); // Dependency quan trọng

    // Xử lý chọn ảnh
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }

        // Lưu file để gửi API
        setSelectedFile(file);

        // Tạo preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImagePreview = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || !chat || !currentUser) {
            return;
        }

        setSending(true);

        try {
            // Logic gửi tin nhắn
            // Lưu ý: sendMessage cần được update để nhận tham số là File hoặc string base64 tùy backend
            const newMessage = await sendMessage(
                chatId,
                currentUser.id,
                'customer',
                messageText.trim(), // Nếu chỉ gửi ảnh, backend cần chấp nhận content rỗng hoặc bạn gửi text mặc định
                imagePreview || undefined // Gửi base64 string (như code cũ) hoặc update service để gửi formData
            );

            // Thêm tin nhắn mới vào state ngay lập tức (Optimistic UI)
            setMessages((prev) => [...prev, newMessage]);

            // Reset form
            setMessageText('');
            removeImagePreview();

        } catch (error) {
            toast.error('Gửi tin nhắn thất bại');
            console.error(error);
        } finally {
            setSending(false);
            // Force scroll sau khi gửi
            setTimeout(scrollToBottom, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isChatClosed = chat?.status === 'closed';

    if (loading) {
        return (
            <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-4 bg-gray-300 rounded-full mb-2"></div>
                        <div>Đang tải cuộc trò chuyện...</div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!chat) return null; // Hoặc render component "Not Found" như cũ

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-140px)]">
                {/* Fix chiều cao cố định để scroll hoạt động tốt hơn */}

                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/custom-request/view/${chat.custom_request_id}`}
                                className="text-gray-600 hover:text-[#0f172a]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold flex items-center gap-2">
                                    {artisan?.name || 'Nghệ nhân'}
                                    <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                    ID: {chatId}
                  </span>
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isChatClosed ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
                                    <span className="text-sm text-gray-600">
                    {isChatClosed ? 'Đã đóng' : 'Đang hoạt động'}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages List - Thêm flex-grow và overflow-auto */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCustomer = message.sender_type === 'customer';
                            // Logic check "Me": là customer VÀ id khớp với user đang login
                            const isMe = isCustomer && message.sender_id === currentUser?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}
                                >
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                                                isMe
                                                    ? 'bg-[#0f172a] text-white rounded-br-none'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {message.image_url && (
                                                <div className="relative w-full min-w-[200px] h-48 rounded-lg overflow-hidden mb-2 bg-gray-300">
                                                    <Image
                                                        src={message.image_url}
                                                        alt="Message image"
                                                        fill
                                                        className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            )}
                                            {message.content && (
                                                // Sử dụng break-words để tránh text dài bị tràn
                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                    {message.content}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                      })}
                    </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <div className="border-t border-gray-200 pt-4 bg-white flex-shrink-0">
                    {isChatClosed ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                            Cuộc trò chuyện này đã kết thúc.
                        </div>
                    ) : (
                        <>
                            {imagePreview && (
                                <div className="relative mb-2 inline-block">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeImagePreview}
                                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2 items-end">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={sending}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={sending}
                                    className="rounded-full shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
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

                                <Button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={sending || (!messageText.trim() && !imagePreview)}
                                    className="bg-[#0f172a] text-white hover:bg-slate-800 rounded-full w-10 h-10 p-0 shrink-0"
                                >
                                    {sending ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    )}
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