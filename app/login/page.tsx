"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { message, Spin } from "antd";
import Cookies from "js-cookie";

export default function Login() {
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((key) => {
      Cookies.remove(key, { path: "/" });
    });
  }, []);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (phone_number.trim() === "" || password.trim() === "") {
      setError("手机号和密码不能为空");
      return;
    }
    setLoading(true);
    try {
        const res = await axios.post("/api/login", { phone_number, password });
        if (res.data.token) {
          // 弹出登录成功提示
          message.success("登录成功！");
          router.push("/");
          // 24小时过期
          document.cookie = `token_yk=${res.data.token}; path=/; max-age=86400`;
          document.cookie = `business_person_id=${res.data.user.business_person_id}; path=/; max-age=86400`;
          localStorage.setItem("user_yk", JSON.stringify(res.data.user));
          setError("");
          setPhoneNumber("");
          setPassword("");
        } else {
          // Handle errors
          const errorData = res.data;
          setError(errorData.message || "Invalid Credentials");
        }
    } catch (error: any) {
      // console.log("Login failed:", error)
      setError("用户名或密码错误，请重试。");
    } finally {
      // 无论成功或失败都关闭loading状态
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-gray-100"
      // style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Welcome to 亿政通
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="phone_number"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              手机号:
            </label>
            <input
              type="text"
              id="phone_number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="请输入手机号"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              密码:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          {/* <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 w-full mt-4 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              登录
            </button>
          </div> */}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 w-full mt-4 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
              type="submit"
              disabled={loading}
            >
              <Spin
                spinning={loading}
                size="small"
                style={{ color: "#bfdbfe", marginRight: "8px" }}
              />
              {loading ? "登录中..." : "登录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
