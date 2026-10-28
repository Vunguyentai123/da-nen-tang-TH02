import {
  ref,
  onValue,
  update,
  onDisconnect,
  serverTimestamp,
  get,
} from 'firebase/database';
import { db } from './firebase';
import { UserProfile } from './authService';

/**
 * Thiết lập hệ thống hiện diện (Presence) thời gian thực cho người dùng.
 * Tự động cập nhật online = true khi kết nối và online = false khi ngắt kết nối.
 */
export function setupPresence(uid: string) {
  if (!uid) return () => {};

  const connectedRef = ref(db, '.info/connected');
  const userStatusRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(connectedRef, snapshot => {
    if (snapshot.val() === true) {
      // Khi client ngắt kết nối mạng hoặc đóng ứng dụng
      onDisconnect(userStatusRef)
        .update({
          online: false,
          lastSeen: serverTimestamp(),
        })
        .catch(err => console.warn('Lỗi setup onDisconnect:', err));

      // Đánh dấu online hiện tại
      update(userStatusRef, {
        online: true,
        lastSeen: serverTimestamp(),
      }).catch(err => console.warn('Lỗi update presence:', err));
    }
  });

  return () => {
    unsubscribe();
  };
}

/**
 * Lắng nghe danh sách tất cả người dùng trong hệ thống (loại trừ chính bản thân)
 */
export function subscribeToUsers(
  currentUid: string,
  onUsersChange: (users: UserProfile[]) => void,
) {
  const usersRef = ref(db, 'users');

  const unsubscribe = onValue(
    usersRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onUsersChange([]);
        return;
      }

      const list: UserProfile[] = Object.keys(data)
        .filter(key => key !== currentUid)
        .map(key => ({
          uid: key,
          name: data[key].name || 'Người dùng',
          email: data[key].email || '',
          online: !!data[key].online,
          lastSeen: data[key].lastSeen,
          createdAt: data[key].createdAt,
        }));

      // Sắp xếp người dùng đang online lên trước, sau đó theo tên A-Z
      list.sort((a, b) => {
        if (a.online === b.online) {
          return a.name.localeCompare(b.name);
        }
        return a.online ? -1 : 1;
      });

      onUsersChange(list);
    },
    error => {
      console.warn('Lỗi lấy danh bạ từ Firebase:', error);
      onUsersChange([]);
    },
  );

  return () => {
    unsubscribe();
  };
}

/**
 * Lắng nghe thông tin của một người dùng cụ thể (để cập nhật trạng thái online của người đang chat)
 */
export function subscribeToSingleUser(
  uid: string,
  onUserChange: (user: UserProfile | null) => void,
) {
  if (!uid) return () => {};

  const userRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(
    userRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onUserChange(null);
        return;
      }
      onUserChange({
        uid,
        name: data.name || 'Người dùng',
        email: data.email || '',
        online: !!data.online,
        lastSeen: data.lastSeen,
      });
    },
    error => {
      console.warn('Lỗi lắng nghe user:', error);
    },
  );

  return () => {
    unsubscribe();
  };
}

/**
 * Lấy thông tin người dùng 1 lần
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { uid, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.warn('Lỗi getUserProfile:', error);
    return null;
  }
}
