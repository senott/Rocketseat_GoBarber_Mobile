import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${Platform.OS === 'android' ? 170 : 0}px 30px
    ${Platform.OS === 'android' ? 150 : 40}px;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const UserAvatarButton = styled.TouchableOpacity``;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 93px;
  align-self: center;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
`;
ButtonContainer.displayName = 'ButtonContainer';

export const BackButton = styled.TouchableOpacity`
  margin-right: auto;
`;
BackButton.displayName = 'BackButton';

export const SignoutButton = styled.TouchableOpacity`
  margin-left: auto;
`;
SignoutButton.displayName = 'SignoutButton';
