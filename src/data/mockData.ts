export interface User {
  id: string;
  name: string;
  online: boolean;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  time: string;
  me: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export const PRIMARY = '#0066CC';
export const PRIMARY_LIGHT = '#E6F0FA';

export const currentUser: User = {
  id: 'me',
  name: 'Nguyễn Tài Vũ',
  online: true,
  email: 'taivu.dev@gmail.com',
  phone: '0987 654 321',
  bio: 'Lập trình viên React Native',
};

export const users: User[] = [
  { id: '1', name: 'An Nguyễn', online: true, email: 'an.nguyen@gmail.com', phone: '0901 234 567' },
  { id: '2', name: 'Bình Trần', online: false, email: 'binh.tran@gmail.com', phone: '0902 345 678' },
  { id: '3', name: 'Chi Lê', online: true, email: 'chi.le@gmail.com', phone: '0903 456 789' },
  { id: '4', name: 'Dũng Phạm', online: true, email: 'dung.pham@gmail.com', phone: '0904 567 890' },
  { id: '5', name: 'Hải Hoàng', online: false, email: 'hai.hoang@gmail.com', phone: '0905 678 901' },
  { id: '6', name: 'Lan Vũ', online: true, email: 'lan.vu@gmail.com', phone: '0906 789 012' },
  { id: '7', name: 'Minh Đỗ', online: false, email: 'minh.do@gmail.com', phone: '0907 890 123' },
  { id: '8', name: 'Thu Hà', online: true, email: 'thuha@gmail.com', phone: '0908 901 234' },
  { id: '9', name: 'Quang Huy', online: false, email: 'quang.huy@gmail.com', phone: '0909 012 345' },
];

export const conversations: Conversation[] = [
  {
    id: 'c1',
    userId: '1',
    name: 'An Nguyễn',
    lastMessage: 'Ok, mai mình gặp nhau thảo luận nhé!',
    time: '10:30',
    unread: 2,
    online: true,
  },
  {
    id: 'c2',
    userId: '2',
    name: 'Bình Trần',
    lastMessage: 'Đã gửi tài liệu dự án qua mail rồi nha.',
    time: '09:15',
    unread: 0,
    online: false,
  },
  {
    id: 'c3',
    userId: '3',
    name: 'Chi Lê',
    lastMessage: 'Deadline bài tập là thứ Sáu tuần này đấy!',
    time: 'Hôm qua',
    unread: 5,
    online: true,
  },
  {
    id: 'c4',
    userId: '4',
    name: 'Dũng Phạm',
    lastMessage: 'Cảm ơn bạn nhiều nha!',
    time: 'Hôm qua',
    unread: 0,
    online: true,
  },
  {
    id: 'c5',
    userId: '5',
    name: 'Hải Hoàng',
    lastMessage: 'Để mình kiểm tra lại phần giao diện.',
    time: 'T2',
    unread: 1,
    online: false,
  },
  {
    id: 'c6',
    userId: '6',
    name: 'Lan Vũ',
    lastMessage: 'Haha chuẩn luôn bạn ơi! 🚀',
    time: 'T2',
    unread: 0,
    online: true,
  },
  {
    id: 'c7',
    userId: '8',
    name: 'Thu Hà',
    lastMessage: 'Chiều nay có đi uống cà phê không?',
    time: '12/10',
    unread: 0,
    online: true,
  },
];

export const initialMessages: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1_1', conversationId: 'c1', text: 'Chào An, hôm nay có rảnh không?', me: true, time: '10:15' },
    { id: 'm1_2', conversationId: 'c1', text: 'Chào bạn! Mình rảnh sau 2h chiều nè.', me: false, time: '10:18' },
    { id: 'm1_3', conversationId: 'c1', text: 'Tuyệt, chúng ta cùng làm bài tập React Native nhé.', me: true, time: '10:25' },
    { id: 'm1_4', conversationId: 'c1', text: 'Ok, mai mình gặp nhau thảo luận nhé!', me: false, time: '10:30' },
  ],
  c2: [
    { id: 'm2_1', conversationId: 'c2', text: 'Bình gửi giúp mình file báo cáo với nhé!', me: true, time: '08:45' },
    { id: 'm2_2', conversationId: 'c2', text: 'Đã gửi tài liệu dự án qua mail rồi nha.', me: false, time: '09:15' },
  ],
  c3: [
    { id: 'm3_1', conversationId: 'c3', text: 'Alo Vũ ơi!', me: false, time: '08:00' },
    { id: 'm3_2', conversationId: 'c3', text: 'Deadline bài tập là thứ Sáu tuần này đấy!', me: false, time: 'Hôm qua' },
  ],
  c4: [
    { id: 'm4_1', conversationId: 'c4', text: 'Code mình đã merge vào nhánh main rồi.', me: true, time: '14:20' },
    { id: 'm4_2', conversationId: 'c4', text: 'Cảm ơn bạn nhiều nha!', me: false, time: 'Hôm qua' },
  ],
  c5: [
    { id: 'm5_1', conversationId: 'c5', text: 'Để mình kiểm tra lại phần giao diện.', me: false, time: 'T2' },
  ],
  c6: [
    { id: 'm6_1', conversationId: 'c6', text: 'Giao diện ứng dụng đẹp và mượt quá!', me: true, time: '11:00' },
    { id: 'm6_2', conversationId: 'c6', text: 'Haha chuẩn luôn bạn ơi! 🚀', me: false, time: 'T2' },
  ],
};

export const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Tin nhắn mới',
    content: 'An Nguyễn đã gửi cho bạn 2 tin nhắn mới trong cuộc trò chuyện.',
    time: '10:30',
    read: false,
  },
  {
    id: 'n2',
    title: 'Nhắc nhở công việc',
    content: 'Chi Lê đã nhắc đến bạn: Deadline nộp bài tập là thứ Sáu tuần này.',
    time: '09:00',
    read: false,
  },
  {
    id: 'n3',
    title: 'Kết bạn mới',
    content: 'Dũng Phạm đã chấp nhận lời mời kết bạn của bạn.',
    time: 'Hôm qua',
    read: false,
  },
  {
    id: 'n4',
    title: 'Đăng nhập thành công',
    content: 'Tài khoản của bạn vừa đăng nhập trên thiết bị Android.',
    time: 'Hôm qua',
    read: true,
  },
  {
    id: 'n5',
    title: 'Chào mừng thành viên mới',
    content: 'Chào mừng bạn đến với UDU Chat! Hãy kết nối bạn bè ngay bây giờ.',
    time: '01/10',
    read: true,
  },
];
