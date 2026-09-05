import User from './user';

export default interface WorkOrderHistory {
  id: number;
  user: User;
  name: string;
  createdAt: string;
}
