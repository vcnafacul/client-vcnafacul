import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "../src/index.css";

// Raleway carregada como no index.html (tickets/059 §2.4).
const FONTE_ID = "storybook-raleway";
if (typeof document !== "undefined" && !document.getElementById(FONTE_ID)) {
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";
  const css = document.createElement("link");
  css.id = FONTE_ID;
  css.rel = "stylesheet";
  css.href =
    "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
  document.head.append(pre1, pre2, css);
}

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { matchers: { color: /(background|color)$/i } },
    viewport: {
      options: {
        mobile: { name: "Celular (390)", styles: { width: "390px", height: "844px" }, type: "mobile" },
        tablet: { name: "Tablet (768)", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        desktop: { name: "Desktop (1200)", styles: { width: "1200px", height: "800px" }, type: "desktop" },
      },
    },
  },
  initialGlobals: { theme: "neutral" },
  globalTypes: {
    theme: {
      description: "Tema da seção ([data-theme])",
      toolbar: {
        title: "Tema",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "neutral", title: "neutral" },
          { value: "marine", title: "marine" },
          { value: "yellow", title: "yellow" },
        ],
      },
    },
  },
  decorators: [
    (Story, { globals }) => (
      <MemoryRouter>
        <div
          data-theme={globals.theme ?? "neutral"}
          className="bg-background p-4 font-sans text-body text-foreground"
        >
          <Story />
          <ToastContainer position="top-right" theme="colored" />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default preview;
