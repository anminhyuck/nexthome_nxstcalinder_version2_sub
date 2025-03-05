export type PriorityLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface Todo {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  categoryId: string;
  priority: PriorityLevel;
  keywords?: string[];
} 