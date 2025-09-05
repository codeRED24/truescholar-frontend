import "../globals.css";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Tooltip.Provider>{children}</Tooltip.Provider>
    </main>
  );
}
