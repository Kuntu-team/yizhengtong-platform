"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: string;
  employeeId: string;
  team: string;
  manager: string;
  regions: string[];
  lastLoginTime: number;
  lastLoginLocation: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

export function AppLayout({
  children,
  hideNavigation = false,
}: AppLayoutProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isSubPage = pathname !== "/" || hideNavigation;

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((key) => {
      Cookies.remove(key, { path: "/" });
    });
    setIsMenuOpen(false);
    router.push("/login");
    toast({
      description: "已退出登录",
    });
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    router.push("/profile");
  };

  const handleTeamManagementClick = () => {
    setIsMenuOpen(false);
    router.push("/team-management");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-business-gray-50">
      {/* 商务风格顶部导航栏 */}
      {!isSubPage && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border-b border-business-gray-200 fixed top-0 w-full z-50 shadow-sm"
        >
          <div className="h-20 px-8 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHomeClick}
                className="text-2xl font-semibold text-business-gray-900 hover:text-business-blue-600 transition-colors duration-300"
              >
                亿政通
              </motion.button>

              <nav className="hidden md:flex items-center gap-10">
                <Link
                  href="/directory"
                  className="text-base font-medium text-business-gray-700 hover:text-business-blue-600 transition-colors duration-300 tracking-wide"
                >
                  关键人物花名册
                </Link>
                <Link
                  href="/leads"
                  className="text-base font-medium text-business-gray-700 hover:text-business-blue-600 transition-colors duration-300 tracking-wide"
                >
                  销售线索
                </Link>
                <Link
                  href="/policies"
                  className="text-base font-medium text-business-gray-700 hover:text-business-blue-600 transition-colors duration-300 tracking-wide"
                >
                  新政新知
                </Link>
                <Link
                  href="/visualization"
                  className="text-base font-medium text-business-gray-700 hover:text-business-blue-600 transition-colors duration-300 tracking-wide"
                >
                  竞态看板
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* 通知下拉框 */}
              <NotificationDropdown />

              {/* 用户菜单 */}
              <div className="relative user-menu-container">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleMenu}
                  className="hover:bg-business-gray-100 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300"
                >
                  <User className="h-5 w-5 text-business-gray-700" />
                </motion.button>

                {/* 下拉菜单 */}
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-business-gray-200 py-2 z-50"
                  >
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-3 text-left hover:bg-business-gray-50 flex items-center gap-3 text-business-gray-700"
                    >
                      <User className="h-4 w-4" />
                      个人中心
                    </button>
                    {/* <button
                      onClick={handleTeamManagementClick}
                      className="w-full px-4 py-3 text-left hover:bg-business-gray-50 flex items-center gap-3 text-business-gray-700"
                    >
                      <Users className="h-4 w-4" />
                      人员管理
                    </button> */}
                    <div className="border-t border-business-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-business-red-50 flex items-center gap-3 text-business-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* 页面内容 */}
      <main className={isSubPage ? "" : "pt-20"}>{children}</main>
    </div>
  );
}
