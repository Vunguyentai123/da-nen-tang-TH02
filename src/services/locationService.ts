import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Xin cấp quyền vị trí trên Android / iOS
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization();
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const hasLocationPermission =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

    if (hasLocationPermission) {
      return true;
    }

    Alert.alert(
      'Quyền vị trí bị từ chối',
      'Quyền vị trí của ứng dụng đã bị tắt. Hãy bật quyền Vị trí trong phần Cài đặt ứng dụng.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
      ],
    );

    return false;
  } catch (err) {
    console.warn('Lỗi xin quyền vị trí:', err);
    return false;
  }
}

/**
 * Lấy tọa độ hiện tại của người dùng
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise(async (resolve, reject) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      reject(new Error('PERMISSION_DENIED'));
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.warn('Lỗi lấy tọa độ:', error);
        Alert.alert(
          'Không thể lấy vị trí',
          'Vui lòng bật định vị GPS trên thiết bị của bạn và thử lại.',
        );
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

/**
 * Mở Google Maps ứng với tọa độ
 */
export function openLocationOnMap(latitude: number, longitude: number) {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết bản đồ trên thiết bị này.');
      }
    })
    .catch(err => console.warn('Lỗi mở bản đồ:', err));
}
