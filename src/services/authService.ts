import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, update } from 'firebase/database';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  online: boolean;
  lastSeen?: number | object;
  createdAt?: number;
}

/**
 * Chuyển đổi mã lỗi Firebase thành thông báo tiếng Việt thân thiện
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản khác.';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được kích hoạt trên Firebase.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu! Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Tài khoản hoặc mật khẩu không chính xác.';
    case 'auth/too-many-requests':
      return 'Đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau ít phút.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng! Vui lòng kiểm tra kết nối Internet.';
    default:
      return 'Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin và cấu hình Firebase.';
  }
}

/**
 * Đăng ký tài khoản mới bằng Email và Mật khẩu
 */
export async function registerUser(
  name: string,
  email: string,
  pass: string,
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    pass,
  );
  const user = userCredential.user;

  // Cập nhật displayName cho user
  await updateProfile(user, {
    displayName: name.trim(),
  });

  // Lưu thông tin người dùng vào Realtime Database tại /users/{uid}
  const userRef = ref(db, `users/${user.uid}`);
  await set(userRef, {
    uid: user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now(),
  });

  return user;
}

/**
 * Đăng nhập tài khoản bằng Email và Mật khẩu
 */
export async function loginUser(
  email: string,
  pass: string,
): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    pass,
  );
  const user = userCredential.user;

  // Cập nhật trạng thái online
  try {
    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, {
      online: true,
      lastSeen: Date.now(),
    });
  } catch (e) {
    console.warn('Lỗi cập nhật trạng thái online khi đăng nhập:', e);
  }

  return user;
}

/**
 * Đăng xuất tài khoản
 */
export async function logoutUser(): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, {
        online: false,
        lastSeen: Date.now(),
      });
    } catch (e) {
      console.warn('Lỗi cập nhật trạng thái offline khi đăng xuất:', e);
    }
  }
  await signOut(auth);
}

/**
 * Lấy người dùng hiện tại đang đăng nhập
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Lắng nghe thay đổi trạng thái đăng nhập
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
