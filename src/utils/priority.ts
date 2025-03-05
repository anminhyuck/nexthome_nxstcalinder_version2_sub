type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type PriorityColor = string;
type PriorityLabel = string;

export const getPriorityColor = (priority: Priority): PriorityColor => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500 text-white';
    case 'MEDIUM':
      return 'bg-gray-400 text-white';
    case 'LOW':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

export const getPriorityLabel = (priority: Priority): PriorityLabel => {
  switch (priority) {
    case 'HIGH':
      return '중요';
    case 'MEDIUM':
      return '보통';
    case 'LOW':
      return '안중요';
    default:
      return '보통';
  }
};

export type { Priority }; 