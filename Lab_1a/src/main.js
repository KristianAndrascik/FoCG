import { App } from "./app/app.js";

window.addEventListener("DOMContentLoaded", () => {
  const app = new App("gl-canvas");
  app.init();
});