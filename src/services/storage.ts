import * as SecureStore from "expo-secure-store";
import {
  ASYNC_STORAGE_KEYS,
  SECURE_STORAGE_KEYS,
} from "../constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  //Secure Storage(for auth & token)
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(SECURE_STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(SECURE_STORAGE_KEYS.AUTH_TOKEN);
  },

  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.AUTH_TOKEN);
  },

  //Async Storage
  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
  },
  async isOnboardingDone(): Promise<boolean> {
    const isDone = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETED,
    );
    return isDone === "true";
  },

  async resetIsOnboarding(): Promise<void> { //for testings, remove after completion
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETED);
  },
};
