import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTimeAgo1 = (isoDate: string): string => {
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
export function getTimeAgo(dateString: string): string {
  // 检查输入是否为空或无效
  if (!dateString || dateString === "null" || dateString === "undefined") {
    return "未知时间";
  }

  // 尝试解析日期字符串
  let date: Date;

  // 如果是时间戳字符串，转换为数字
  if (/^\d+$/.test(dateString)) {
    date = new Date(parseInt(dateString, 10));
  } else {
    // 尝试直接解析日期字符串
    date = new Date(dateString);
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return "未知时间";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // 检查差值是否有效
  if (isNaN(diffMs)) {
    return "未知时间";
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears}年前`;
  } else if (diffMonths > 0) {
    return `${diffMonths}个月前`;
  } else if (diffWeeks > 0) {
    return `${diffWeeks}周前`;
  } else if (diffDays > 0) {
    return `${diffDays}天前`;
  } else {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) {
        return `${diffMinutes}分钟前`;
      } else {
        return "刚刚";
      }
    }
  }
}
