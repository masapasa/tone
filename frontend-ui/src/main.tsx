import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-wallet/tonconnect-manifest.json"
  uiPreferences={{theme: THEME.DARK}}
  walletsListConfiguration={{
    includeWallets: [
      {
        appName: "safepalwallet",
        name: "SafePal",
        imageUrl: "https://s.pvcliping.com/web/public_image/SafePal_x288.png",
        tondns: "",
        aboutUrl: "https://www.safepal.com",
        universalLink: "https://link.safepal.io/ton-connect",
        jsBridgeKey: "safepalwallet",
        bridgeUrl: "https://ton-bridge.safepal.com/tonbridge/v1/bridge",
        platforms: ["ios", "android", "chrome", "firefox"]
      },
      {
        appName: "tonwallet",
        name: "TON Wallet",
        imageUrl: "https://wallet.ton.org/assets/ui/qr-logo.png",
        aboutUrl: "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd",
        universalLink: "https://wallet.ton.org/ton-connect",
        jsBridgeKey: "tonwallet",
        bridgeUrl: "https://bridge.tonapi.io/bridge",
        platforms: ["chrome", "android"]
      }
    ]
  }}
  actionsConfiguration={{
    twaReturnUrl: 'https://t.me/tc_twa_demo_bot/start'
      }}
      
  >
    <App />
  </TonConnectUIProvider>
);
