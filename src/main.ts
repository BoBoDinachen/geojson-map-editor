import { createApp } from "vue";
import "./styles/normalize.css";
import "./styles/root.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import App from "./App.vue";
import { setupGlobalComponent } from "@/views/components/global_components";
import naive from "naive-ui";

const app = createApp(App);

setupGlobalComponent(app);
app.use(naive);

app.mount("#app");
