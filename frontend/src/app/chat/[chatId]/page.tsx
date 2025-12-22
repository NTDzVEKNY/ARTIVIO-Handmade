'use client';

import { useState, useEffect, useRef } from 'react';
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
  const router = useRouter();
  const chatId = Array.isArray(params.chatId) ? Number(params.chatId[0]) : Number(params.chatId);

  const [chat, setChat] = useState<Chat | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat data
  useEffect(() => {
    if (!chatId || Number.isNaN(chatId)) {
      toast.error('ID cuộc trò chuyện không hợp lệ');
      setLoading(false);
      return;
    }

    const loadChatData = async () => {
      try {
        const [chatData, messagesData, userData] = await Promise.all([
          getChatById(chatId),
          getChatMessages(chatId),
          Promise.resolve(getCurrentUser()),
        ]);

        if (!chatData) {
          toast.error('Không tìm thấy cuộc trò chuyện');
          setLoading(false);
          return;
        }

        setChat(chatData);
        setCurrentUser(userData);

        // Load artisan
        const artisanData = await getArtisanById(chatData.artisan_id);
        setArtisan(artisanData);

        // Initialize mock chat if no messages
        if (messagesData.length === 0) {
          initializeMockChat(chatId);
          const updatedMessages = await getChatMessages(chatId);
          setMessages(updatedMessages);
        } else {
          setMessages(messagesData);
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [chatId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !imagePreview) {
      return;
    }

    if (!chat || !currentUser) {
      return;
    }

    setSending(true);

    try {
      const newMessage = await sendMessage(
        chatId,
        currentUser.id,
        'customer',
        messageText.trim() || '(Hình ảnh)',
        imagePreview || undefined
      );

      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
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

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center py-24">Đang tải...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy cuộc trò chuyện</h2>
            <Link href="/shop/products" className="text-[#0f172a] hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isChatClosed = chat.status === 'closed';

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col container mx-auto px-6 py-6 max-w-4xl">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/custom-request/view/${chat.custom_request_id}`}
                className="text-gray-600 hover:text-[#0f172a]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  {artisan?.name || 'Nghệ nhân'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isChatClosed ? 'bg-gray-400' : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {isChatClosed ? 'Đã đóng' : 'Đang hoạt động'}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/custom-request/view/${chat.custom_request_id}`}
              className="text-sm text-[#0f172a] hover:underline"
            >
              Xem chi tiết yêu cầu
            </Link>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </div>
          ) : (
            messages.map((message) => {
              const isCustomer = message.sender_type === 'customer';
              const isCurrentUser = isCustomer && message.sender_id === currentUser?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCustomer
                        ? 'bg-[#0f172a] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.image_url && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2 bg-gray-200">
                        <Image
                          src={message.image_url}
                          alt="Message image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isCustomer ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="border-t border-gray-200 pt-4">
          {isChatClosed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Cuộc trò chuyện này đã được đóng. Bạn không thể gửi tin nhắn mới.
              </p>
            </div>
          )}

          {imagePreview && (
            <div className="relative mb-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={removeImagePreview}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                disabled={sending || isChatClosed}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={sending || isChatClosed}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || isChatClosed}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isChatClosed ? 'Cuộc trò chuyện đã đóng' : 'Nhập tin nhắn...'}
              disabled={sending || isChatClosed}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={sending || isChatClosed || (!messageText.trim() && !imagePreview)}
              className="bg-[#0f172a] text-white hover:bg-gray-800"
            >
              {sending ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

