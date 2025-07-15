import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import AntdClientWrapper from "@/components/AntdClientWrapper";
import "@ant-design/v5-patch-for-react-19";

export const metadata: Metadata = {
  title: "亿政通",
  description: "亿政通-智能政务服务平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ WebkitTouchCallout: 'none' }}>
      <body>
        <AntdClientWrapper>{children}</AntdClientWrapper>
      </body>
    </html>
  );
}
