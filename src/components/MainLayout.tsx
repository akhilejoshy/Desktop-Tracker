import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children, footerProps }: { children: React.ReactNode; footerProps?: any }) {
  return (
    <div className="flex h-screen   justify-center">
      <div
        className="w-full  rounded-lg bg-background"
      >
        <div className="flex h-full flex-col " >
          <Header />
          <main className="flex-1 overflow-y-auto py-4 px-6">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
