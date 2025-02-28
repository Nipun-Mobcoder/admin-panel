import { leaveType } from '../enum/leaveType.enum';

export const defaultLeaves: Record<leaveType, number> = {
  [leaveType.FL]: 0,
  [leaveType.CL]: 0,
  [leaveType.SL]: 0,
  [leaveType.LWP]: 0,
  [leaveType.CO]: 0,
  [leaveType.SHL]: 0,
};
