import { WavRecorder, WavStreamPlayer } from "wavtools";

/**
 * VoiceChatService - Handles WebSocket communication, audio recording, 
 * playback, and text-based chat interactions.
 */
class VoiceChatService {
  constructor(channel =null, setup_ws=false) {
    this.ws = null;
    if(setup_ws) this.setup_ws(channel);
    this.init_recorder();
    this.init_player();
    this.track_id = 1;
    this.is_recording = false;
    this.is_muted = false;
    this.is_speaking = false;
    this.on_chat_input = console.log;
    this.on_panel_input = console.log;
    this.on_message = console.log;
    this.on_speak_start = console.log;
    this.on_speak_end = console.log;
    this.on_record_start = console.log;
    this.on_record_stop = console.log;
    this.on_clear = console.log;
    this.message = '';
    this.chat_input = null;
    this.input = null;
    this.last_tick_time = 0;
    this.timeout_threshold = 60000;
    this.ws_send = this.ws_send.bind(this);
    this.ws_send_raw = this.ws_send_raw.bind(this);
    this.send_text_message = this.send_text_message.bind(this);
    this.reset_on_timeout = this.reset_on_timeout.bind(this);
  }
  setup_ws(
    ws_port = process.env.REACT_APP_WS_PORT ?? 6123,
    ws_host = process.env.NEXT_PUBLIC_WS_HOST,
    ws_path = "/",
    ws_protocol = process.env.NEXT_PUBLIC_WS_PROTOCOL ?? "ws://"
  ) {
    this.ws = new WebSocket(`${ws_protocol}${ws_host}:${ws_port}${ws_path}`);
    this.ws.onopen = () => console.log("WebSocket connected");
    this.ws.onclose = () => console.log("WebSocket disconnected");
    this.ws.onerror = console.error;
    this.ws.onmessage = this.handle_ws_message.bind(this);
  }
  async setup() {
    await this.recorder.begin();
    await this.player.connect();
    setInterval(() => {
      this.update_speaking_status(this.player.getFrequencies().values.some((v) => v > 0));
      this.reset_on_timeout();
    },100);
  }
  handle_ws_message(event) {
    this.tick();
    this.last_response_timestamp = Date.now();
    let data = event.data;
    console.log("Raw socket data:", data);
    try {
      const command = JSON.parse(data);
      if (command.type) {
        switch (command.type) {
          case "ui.chat":
            return this.on_chat_input(command.payload);
          case "ui.input":
            return this.on_panel_input(command.payload);
          case "ui.clear":
            return this.on_clear();
          case "text.delta":
            this.message += command.message ?? command.delta;
            this.on_panel_input(this.message);
            return
          case "text.completed":
            this.on_message({
              message: this.message,
              from: 'bot',
            });
            this.message = '';
            return
          case "transcription":
            this.on_message({
              message: command.message,
              from: 'user',
            });
            return
          case "qr.image.get":
            if (this.on_qr_image_get) this.on_qr_image_get();
            console.log('Simulating QR scan...');
            this.ws_send({ type: "command", command: "qr.scan", payload: "SIMULATED" });
            return;
          case "dedicated.revoke":
            // Ignore
            return;
          default:
            console.log("Unprocessed command")
        }
      }
      if (command === "interrupt") return this.audio_interrupt();
    } catch {
      if (this.is_base64(data)) {
        if (!this.is_recording) this.audio_play(this.base64_to_int16(data));
        return;
      }
      if (data === "interrupt") return this.audio_interrupt();
    }
  }
  ws_is_ready() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  ws_send_raw(data) {
    this.tick();
    this.last_response_timestamp = Date.now();
    try {
      this.ws.send(data);
    } catch (error) {
      console.error(error);
    }
  }
  ws_send(payload) {
    console.log('Sending to backend:', payload);
    this.ws_send_raw(JSON.stringify(payload));
  }
  async start_recording() {
    if (this.is_muted) return;
    this.is_recording = true;
    this.player.interrupt();
    this.ws_send({ type: "command", command: "response.cancel" });
    this.on_record_start();
    await this.recorder.record((data) => {
      if (this.ws_is_ready()) this.ws_send_raw(data.mono);
    });
  }
  async stop_recording() {
    this.is_recording = false;
    this.on_record_stop();
    await this.recorder.pause();
    if (this.ws_is_ready()) {
      this.ws_send({ type: "command", command: "commit" });
    }
  }
  audio_play(audio_buffers) {
    try {
      this.player.add16BitPCM(audio_buffers, this.get_track_id());
    } catch (e) {
      console.warn('Audio playback error:', e);
      // Optionally: ignore error for text-only chat
    }
  }
  audio_interrupt() {
    this.player.interrupt();
  }
  get_track_id() {
    return String(this.track_id++);
  }
  mute(is_muted = true) {
    if (is_muted) this.stop_recording();
    this.is_muted = is_muted;
  }
  send_text_message(text){
    this.ws_send({
      'type': 'command',
      'command': 'text',
      'payload': text,
    });
    this.on_message({
      message: text,
      from: 'user',
    });
  }
  set_language(code) {
    this.ws_send({ type: "command", command: "lang", payload: code });
  }
  update_speaking_status(speaking) {
    if (speaking !== this.is_speaking) {
      speaking ? this.on_speak_start() : this.on_speak_end();
    }
    this.is_speaking = speaking;
  }
  is_base64(data) {
    return /^[A-Za-z0-9+/]+={0,2}$/.test(data) && data.length % 4 === 0;
  }
  base64_to_int16(base64_string) {
    return new Int16Array(Uint8Array.from(atob(base64_string), (c) => c.charCodeAt(0)).buffer);
  }
  tick() {
    this.last_tick_time = new Date();
  }
  reset_on_timeout() {
    if (!this.last_tick_time) return;
    const now = new Date();
    const elapsed = now - this.last_tick_time;
    if (elapsed >= this.timeout_threshold) {
      this.ws_send({ type: "command", command: "reset" });
      window.location.reload();
    }
  }
  init_player(sampleRate = 24000) {
    this.player = new WavStreamPlayer({ sampleRate });
    this.player.connect();
  }
  init_recorder(sampleRate = 24000) {
    this.recorder = new WavRecorder({ sampleRate });
  }
}

export default VoiceChatService; 