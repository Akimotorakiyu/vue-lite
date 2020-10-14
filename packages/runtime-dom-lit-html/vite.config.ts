import type { UserConfig } from "vite";
// import i18n from "@intlify/vite-plugin-vue-i18n";

const config: UserConfig = {
  vueCustomBlockTransforms: {
    // i18n,
  },
  outDir: "../../docs/",
  base: "/vue-lite",
};

export default config;
