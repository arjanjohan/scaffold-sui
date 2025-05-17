import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldSuiAppWithProviders } from "~~/components/ScaffoldSuiAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-sui/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold Sui App",
  description: "Built with 🏗 Scaffold Sui",
});

const ScaffoldSuiApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem={false} defaultTheme="dark">
          <ScaffoldSuiAppWithProviders>{children}</ScaffoldSuiAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldSuiApp;
