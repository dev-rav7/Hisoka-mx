module.exports = {
  SESSION_ID: process.env.SESSION_ID || "",
  PREFIX: process.env.PREFIX || ".",
  MODE: process.env.MODE || "public",
  READ_MESSAGE: process.env.READ_MESSAGE || "false",
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "false",
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "false",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "Hello from bot!",
  AUTO_REACT: process.env.AUTO_REACT || "false",
  CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
  CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "🙂,😔",
  DEV: "2250101676111",
}
