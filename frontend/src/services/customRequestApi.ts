// TODO: Replace with real REST API integration
import type { CustomRequest, Chat, Message, Artisan, User } from '@/types';

// Mock data storage (in-memory)
let mockCustomRequests: CustomRequest[] = [];
let mockChats: Chat[] = [];
let mockMessages: Message[] = [];
let nextRequestId = 1;
let nextChatId = 1;
let nextMessageId = 1;

// Mock users
const mockArtisan: Artisan = {
  id: 1,
  name: 'Nguyễn Văn Thợ',
  email: 'artisan@example.com',
  avatar: '/hero-handmade.jpg',
};

const mockCustomer: User = {
  id: 1,
  name: 'Khách hàng',
  email: 'customer@example.com',
};

/**
 * Create a custom request
 * TODO: Replace with real API call: POST /api/custom-requests
 */
export async function createCustomRequest(
  productId: number,
  data: {
    title: string;
    description: string;
    custom_options: {
      color?: string;
      size?: string;
      material?: string;
    };
    expected_price?: number;
    deadline?: string;
    reference_images: string[];
    note?: string;
  }
): Promise<{ customRequest: CustomRequest; chat: Chat }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date().toISOString();
  const customRequestId = nextRequestId++;
  const chatId = nextChatId++;

  // Create chat first
  const chat: Chat = {
    id: chatId,
    custom_request_id: customRequestId,
    customer_id: mockCustomer.id,
    artisan_id: mockArtisan.id,
    status: 'open',
    created_at: now,
    updated_at: now,
  };

  // Create custom request
  const customRequest: CustomRequest = {
    id: customRequestId,
    product_id: productId,
    customer_id: mockCustomer.id,
    artisan_id: mockArtisan.id,
    chat_id: chatId,
    title: data.title,
    description: data.description,
    custom_options: data.custom_options,
    expected_price: data.expected_price,
    deadline: data.deadline,
    reference_images: data.reference_images,
    note: data.note,
    status: 'PENDING',
    created_at: now,
    updated_at: now,
  };

  mockCustomRequests.push(customRequest);
  mockChats.push(chat);

  return { customRequest, chat };
}

/**
 * Get custom request by ID
 * TODO: Replace with real API call: GET /api/custom-requests/:id
 */
export async function getCustomRequestById(id: number): Promise<CustomRequest | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCustomRequests.find((r) => r.id === id) || null;
}

/**
 * Get chat by ID
 * TODO: Replace with real API call: GET /api/chats/:id
 */
export async function getChatById(id: number): Promise<Chat | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockChats.find((c) => c.id === id) || null;
}

/**
 * Get messages for a chat
 * TODO: Replace with real API call: GET /api/chats/:id/messages
 * TODO: Implement WebSocket for real-time updates
 */
export async function getChatMessages(chatId: number): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockMessages
    .filter((m) => m.chat_id === chatId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Send a message
 * TODO: Replace with real API call: POST /api/chats/:id/messages
 * TODO: Implement WebSocket for real-time messaging
 */
export async function sendMessage(
  chatId: number,
  senderId: number,
  senderType: 'customer' | 'artisan',
  content: string,
  imageUrl?: string
): Promise<Message> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const message: Message = {
    id: nextMessageId++,
    chat_id: chatId,
    sender_id: senderId,
    sender_type: senderType,
    content,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
  };

  mockMessages.push(message);

  return message;
}

/**
 * Get artisan by ID
 * TODO: Replace with real API call: GET /api/artisans/:id
 */
export async function getArtisanById(id: number): Promise<Artisan | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  // For now, return mock artisan
  return id === mockArtisan.id ? mockArtisan : null;
}

/**
 * Get current user (mock)
 * TODO: Replace with real authentication context
 */
export function getCurrentUser(): User {
  return mockCustomer;
}

/**
 * Initialize mock chat with some messages (for demo)
 */
export function initializeMockChat(chatId: number): void {
  // Add a welcome message from artisan
  const welcomeMessage: Message = {
    id: nextMessageId++,
    chat_id: chatId,
    sender_id: mockArtisan.id,
    sender_type: 'artisan',
    content: 'Xin chào! Tôi đã nhận được yêu cầu của bạn. Tôi sẽ xem xét và phản hồi sớm nhất có thể.',
    created_at: new Date().toISOString(),
  };
  mockMessages.push(welcomeMessage);
}

