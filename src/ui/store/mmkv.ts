import { createMMKV } from 'react-native-mmkv';

// Single shared MMKV instance for the whole app. Phase 14 stores are tiny;
// Phase 17+ may add a separate event-log database.
export const storage = createMMKV({ id: 'virtual-pet-default' });
