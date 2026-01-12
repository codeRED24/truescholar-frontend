import { FeedHeader } from "@/features/social";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "../globals.css";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FeedHeader />
      <main className="pt-16 min-h-screen bg-[#F4F2EE] dark:bg-black">
        {children}
      </main>
    </ThemeProvider>
  );
}
