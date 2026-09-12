import type { CustomProp } from '@/types/custom-prop';

export interface CustomPropStore {
  listCustomProps(userId: string): Promise<CustomProp[]>;
  createCustomProp(prop: CustomProp): Promise<CustomProp>;
  renameCustomProp(id: string, name: string): Promise<void>;
  deleteCustomProp(id: string): Promise<void>;
}
