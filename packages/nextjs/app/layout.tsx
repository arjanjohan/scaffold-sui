import "@iota/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldIotaAppWithProviders } from "~~/components/ScaffoldIotaAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-iota/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold IOTA App",
  description: "Built with 🏗 Scaffold IOTA",
});

const ScaffoldIotaApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem={false} defaultTheme="dark">
          <ScaffoldIotaAppWithProviders>{children}</ScaffoldIotaAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldIotaApp;
