import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTimeAgo = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) {
    return "刚刚";
  } else if (diffInSeconds < hour) {
    return `${Math.floor(diffInSeconds / minute)}分钟前`;
  } else if (diffInSeconds < day) {
    return `${Math.floor(diffInSeconds / hour)}小时前`;
  } else if (diffInSeconds < month) {
    return `${Math.floor(diffInSeconds / day)}天前`;
  } else if (diffInSeconds < year) {
    return `${Math.floor(diffInSeconds / month)}个月前`;
  } else {
    return `${Math.floor(diffInSeconds / year)}年前`;
  }
};
