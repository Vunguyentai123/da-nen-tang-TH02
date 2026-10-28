import {
  ref,
  push,
  set,
  onValue,
  runTransaction,
  update,
} from 'firebase/database';
import { db } from './firebase';

export function getFriendlyChatErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : '';
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  switch (code) {
    case 'database/permission-denied':
    case 'PERMISSION_DENIED':
      return 'Firebase từ chối thao tác. Hãy kiểm tra người dùng đã đăng nhập và Realtime Database Rules.';
    case 'database/network-error':
    case 'NETWORK_ERROR':
      return 'Không thể kết nối tới Firebase. Hãy kiểm tra mạng và địa chỉ databaseURL.';
    case 'database/invalid-argument':
    case 'INVALID_ARGUMENT':
      return 'Dữ liệu tin nhắn không hợp lệ.';
    default:
      return code || message
        ? `Firebase không thể gửi tin nhắn (${code || message}).`
        : 'Không thể gửi tin nhắn. Vui lòng thử lại sau.';
  }
}

export interface FirebaseChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  type: 'text' | 'location';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  time: string;
}

export interface FirebaseConversation {
  id: string;
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  timestamp: number;
  time: string;
  unread: number;
}

/**
 * Định dạng thời gian hiển thị thân thiện (HH:mm, Hôm qua, hoặc DD/MM)
 */
export function formatMessageTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  if (isToday) {
    return `${hh}:${mm}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Hôm qua';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Tạo mã phòng chat duy nhất cho 2 người (đảm bảo A chat B hay B chat A đều cùng 1 mã)
 */
export function getChatRoomId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/**
 * Gửi tin nhắn 1-1 (tin thường hoặc tin vị trí)
 */
export async function sendMessage({
  senderId,
  senderName,
  receiverId,
  receiverName,
  text,
  type = 'text',
  location,
}: {
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  type?: 'text' | 'location';
  location?: { latitude: number; longitude: number };
}): Promise<void> {
  if (!senderId || !receiverId) {
    throw new Error('Thiếu thông tin người gửi hoặc người nhận.');
  }

  const chatId = getChatRoomId(senderId, receiverId);
  const timestamp = Date.now();
  const time = formatMessageTime(timestamp);

  const messagesRef = ref(db, `chats/${chatId}/messages`);
  const newMsgRef = push(messagesRef);

  const messageData: FirebaseChatMessage = {
    id: newMsgRef.key || `msg_${timestamp}`,
    senderId,
    senderName,
    receiverId,
    text: text.trim(),
    type,
    timestamp,
    time,
    ...(location ? { location } : {}),
  };

  const displaySnippet = type === 'location' ? '📍 Đã chia sẻ vị trí' : text.trim();

  const senderConversation = {
    partnerId: receiverId,
    partnerName: receiverName,
    lastMessage: displaySnippet,
    timestamp,
    unread: 0,
  };

  // 1. Lưu tin nhắn vào /chats/{chatId}/messages/{msgId}
  await set(newMsgRef, messageData);

  // 2. Cập nhật danh sách hội thoại của người gửi.
  const senderConvRef = ref(db, `userConversations/${senderId}/${receiverId}`);
  await update(senderConvRef, senderConversation);

  // 3. Cập nhật hội thoại người nhận. Transaction cần quyền đọc trên
  // đường dẫn này; giữ nguyên để không làm mất số tin chưa đọc hiện tại.
  const receiverConvRef = ref(db, `userConversations/${receiverId}/${senderId}`);
  await runTransaction(receiverConvRef, currentData => ({
    ...senderConversation,
    partnerId: senderId,
    partnerName: senderName,
    unread: (currentData?.unread || 0) + 1,
  }));
}

/**
 * Lắng nghe tin nhắn trong phòng chat theo thời gian thực.
 * Trả về hàm hủy lắng nghe (cleanup trong useEffect) để tránh hiện lặp tin nhắn.
 */
export function subscribeToMessages(
  chatId: string,
  onMessages: (messages: FirebaseChatMessage[]) => void,
) {
  const messagesRef = ref(db, `chats/${chatId}/messages`);

  const unsubscribe = onValue(
    messagesRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onMessages([]);
        return;
      }

      const list: FirebaseChatMessage[] = Object.keys(data).map(key => ({
        ...data[key],
        id: key,
        time: formatMessageTime(data[key].timestamp),
      }));

      // Sắp xếp theo thứ tự thời gian tăng dần
      list.sort((a, b) => a.timestamp - b.timestamp);
      onMessages(list);
    },
    error => {
      console.warn('Lỗi lắng nghe tin nhắn Firebase:', error);
      onMessages([]);
    },
  );

  return () => {
    unsubscribe();
  };
}

/**
 * Lắng nghe danh sách cuộc trò chuyện của một người dùng theo thời gian thực (Màn hình Home)
 */
export function subscribeToConversations(
  userId: string,
  onConversations: (conversations: FirebaseConversation[]) => void,
) {
  if (!userId) return () => {};

  const conversationsRef = ref(db, `userConversations/${userId}`);

  const unsubscribe = onValue(
    conversationsRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onConversations([]);
        return;
      }

      const list: FirebaseConversation[] = Object.keys(data).map(key => ({
        id: key,
        partnerId: data[key].partnerId || key,
        partnerName: data[key].partnerName || 'Người dùng',
        lastMessage: data[key].lastMessage || '',
        timestamp: data[key].timestamp || 0,
        time: formatMessageTime(data[key].timestamp),
        unread: data[key].unread || 0,
      }));

      // Sắp xếp cuộc trò chuyện mới nhất nằm trên cùng
      list.sort((a, b) => b.timestamp - a.timestamp);
      onConversations(list);
    },
    error => {
      console.warn('Lỗi lắng nghe hội thoại:', error);
      onConversations([]);
    },
  );

  return () => {
    unsubscribe();
  };
}

/**
 * Đặt số tin nhắn chưa đọc của cuộc trò chuyện về 0 khi người dùng mở xem
 */
export async function markConversationAsRead(
  userId: string,
  partnerId: string,
): Promise<void> {
  if (!userId || !partnerId) return;
  try {
    const convRef = ref(db, `userConversations/${userId}/${partnerId}`);
    await update(convRef, { unread: 0 });
  } catch (error) {
    console.warn('Lỗi đánh dấu đã đọc:', error);
  }
}
