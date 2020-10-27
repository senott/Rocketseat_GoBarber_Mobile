import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () =>
  // eslint-disable-next-line global-require
  require('react-native-reanimated/mock'),
);

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
