import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { MyApp } from "./_components/main";
import { Toaster } from "react-hot-toast"; 

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <MyApp>{children}</MyApp>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
