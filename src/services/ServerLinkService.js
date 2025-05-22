import Cookies from "js-cookie";
import Swal from "sweetalert2";

/**
 * ServerLinkService - Manages connection to the server using authentication keys.
 * It attempts to connect using a temporary key first and falls back to an auth key if necessary.
 * Supports automatic retries and configurable callbacks for different connection events.
 */
class ServerLinkService {
  ENDPOINTS = {
    verify: "/api/assistant/verify",
    connect: "/api/assistant/connect",
  };
  TEMPORARY_KEY_MAX_RETRIES = 3;
  AUTH_KEY_MAX_RETRIES = 5;
  RETRY_INTERVAL = 1000;

  constructor(
    SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000",
    AUTH_KEY = process.env.NEXT_PUBLIC_AUTH_KEY?.trim() ||
      new URLSearchParams(window.location.search).get("auth_key") ||
      document.getElementById("entaai_embed")?.getAttribute("auth_key"),
    on_connect = console.info,
    on_fail = console.error,
    on_assistant_load = console.log,
    alert_info = (title, desc) => Swal.fire({ title, text: desc, icon: "info" }),
    alert_error = (title, desc) => Swal.fire({ title, text: desc, icon: "error" })
  ) {
    this.SERVER_URL = SERVER_URL;
    this.AUTH_KEY = AUTH_KEY;
    this.on_connect = on_connect;
    this.on_fail = on_fail;
    this.on_assistant_load = on_assistant_load;
    this.alert_info = alert_info;
    this.alert_error = alert_error;
    this.status = false;
    this.requested = false;
    this.request_no = 0;
    this.temporary_key = null;
    this.channel = null;
    this.connect = this.connect.bind(this);
  }

  connect(force_reconnect = false) {
    console.log("Connecting ...");
    this.AUTH_KEY =
      this.AUTH_KEY ||
      document.getElementById("htask")?.getAttribute("auth_token") ||
      document.body.getAttribute("auth_token") ||
      process.env.NEXT_PUBLIC_AUTH_KEY?.trim() ||
      new URLSearchParams(window.location.search).get("auth_token");
    if (!this.AUTH_KEY) {
      console.log("Auth key not found!");
      this.alert_info("Enter Auth Key", "Please provide an authentication key to proceed.");
      Swal.fire({
        title: "Enter Auth Key (Required):",
        input: "text",
        inputPlaceholder: "Auth Key",
        confirmButtonText: "Submit",
      })
        .then((r) => {
          if (r.isConfirmed && r.value) {
            this.AUTH_KEY = r.value.trim();
            this.connect();
          }
        })
        .catch(() => setTimeout(() => this.connect(), this.RETRY_INTERVAL));
      return;
    }
    console.log("Auth key found:", this.AUTH_KEY);
    if (this.requested && !force_reconnect) return;
    this.requested = true;
    this.status = false;
    let attempts = 0;
    const attempt_connection = (use_temp_key) => {
      if (attempts >= (use_temp_key ? this.TEMPORARY_KEY_MAX_RETRIES : this.AUTH_KEY_MAX_RETRIES)) {
        this.alert_error("Connection Failed", `Failed after ${attempts} attempts.`);
        this.on_fail(`Failed after ${attempts} retries.`);
        return;
      }
      console.log(`Attempt ${attempts + 1}: Connecting with ${use_temp_key ? "Temporary Key" : "Auth Key"}`);
      attempts++;
      (use_temp_key ? this.connect_with_temporary_key() : this.connect_with_auth_key())
        .then((channel) => {
          console.log("Connected successfully:", channel);
          this.status = true;
          this.on_connect(channel);
        })
        .catch((error) => {
          console.error("Connection attempt failed:", error);
          if (use_temp_key && attempts >= this.TEMPORARY_KEY_MAX_RETRIES) {
            console.log("Temporary Key failed, switching to Auth Key...");
            attempt_connection(false);
          } else {
            setTimeout(() => attempt_connection(use_temp_key), this.RETRY_INTERVAL);
          }
        });
    };
    if (this.temporary_key) {
      attempt_connection(true);
    } else {
      attempt_connection(false);
    }
  }

  connect_with_temporary_key(key = null) {
    key = key || this.temporary_key || Cookies.get("temporary_key");
    console.log("Trying to connect with Temporary Key:", key);
    return new Promise((resolve, reject) => {
      if (!key) {
        console.warn("No Temporary Key found!");
        return reject("Temporary Key not found!");
      }
      const url = `${this.SERVER_URL}${this.ENDPOINTS.verify}?temporary_key=${key}`;
      console.log("Temporary Key Request URL:", url);
      fetch(url, { method: "GET" })
        .then((r) => r.json())
        .then((res) => {
          console.log("Temporary Key Response:", res);
          if (res.success && res.channel) {
            this.temporary_key = key;
            this.channel = res.channel;
            if (res.assistant_gif && res.assistant_png) {
              this.on_assistant_load(
                res.assistant_gif.replace("http://", "https://"),
                res.assistant_png.replace("http://", "https://")
              );
            }
            resolve(res.channel);
          } else {
            console.warn("Temporary Key Unauthorized!");
            reject("Unauthorized");
          }
        })
        .catch((error) => {
          console.error("Temporary Key Connection Error:", error);
          reject(error);
        });
    });
  }

  connect_with_auth_key(key = null) {
    key = key || this.AUTH_KEY;
    console.log("Trying to connect with Auth Key:", key);
    return new Promise((resolve, reject) => {
      if (!key) {
        console.warn("No Auth Key found!");
        return reject("Auth Key not found!");
      }
      const url = `${this.SERVER_URL}${this.ENDPOINTS.connect}?auth_key=${key}`;
      console.log("Auth Key Request URL:", url);
      fetch(url, { method: "GET" })
        .then((r) => r.json())
        .then((res) => {
          console.log("Auth Key Response:", res);
          if (res.success && res.temporary_key && res.channel) {
            this.temporary_key = res.temporary_key;
            this.channel = res.channel;
            Cookies.set("temporary_key", this.temporary_key, { expires: 1 });
            if (res.assistant_gif && res.assistant_png) {
              this.on_assistant_load(
                res.assistant_gif.replace("http://", "https://"),
                res.assistant_png.replace("http://", "https://")
              );
            }
            resolve(res.channel);
          } else {
            console.warn("Auth Key Unauthorized!");
            reject("Unauthorized");
          }
        })
        .catch((error) => {
          console.error("Auth Key Connection Error:", error);
          reject(error);
        });
    });
  }
}

const sls = new ServerLinkService();
if (typeof window !== "undefined") {
  window.sls = sls; // @debug
}
export default sls; 