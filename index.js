const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys")

const fs = require("fs")
const P = require("pino")
const config = require("./settings")
const qrcode = require("qrcode-terminal")
const util = require("util")
const FileType = require("file-type")
const axios = require("axios")
const { File } = require("megajs")
const os = require("os")
const path = require("path")

const ownerNumber = ["2250101676111"]
const prefix = config.PREFIX || "."

// Improved temp directory management
const tempDir = path.join(os.tmpdir(), "wa-bot-cache")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Enhanced session management
const SESSION_DIR = path.join(__dirname, "sessions")
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true })
}

// Clear corrupted session files
const clearCorruptedSession = () => {
  try {
    const sessionFiles = ["creds.json", "keys.json", "session-auth-info.json"]
    sessionFiles.forEach((file) => {
      const filePath = path.join(SESSION_DIR, file)
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf8")
          JSON.parse(content) // Test if valid JSON
        } catch (error) {
          console.log(`🗑️ Removing corrupted session file: ${file}`)
          fs.unlinkSync(filePath)
        }
      }
    })
  } catch (error) {
    console.error("Error clearing corrupted sessions:", error)
  }
}

// Download session with better error handling
const downloadSession = async () => {
  if (!config.SESSION_ID) {
    console.log("❌ Please add your session to SESSION_ID env variable!")
    return false
  }

  try {
    console.log("📥 Downloading session...")
    const sessdata = config.SESSION_ID.replace("Wa~", "")
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)

    return new Promise((resolve, reject) => {
      filer.download((err, data) => {
        if (err) {
          console.error("❌ Session download failed:", err.message)
          reject(err)
          return
        }

        try {
          // Validate JSON before saving
          JSON.parse(data.toString())
          fs.writeFileSync(path.join(SESSION_DIR, "creds.json"), data)
          console.log("✅ Session downloaded successfully")
          resolve(true)
        } catch (parseError) {
          console.error("❌ Invalid session data:", parseError.message)
          reject(parseError)
        }
      })
    })
  } catch (error) {
    console.error("❌ Session download error:", error.message)
    return false
  }
}

const express = require("express")
const app = express()
const port = process.env.PORT || 9090

let conn
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

// Enhanced connection function with better error handling
async function connectToWA() {
  try {
    console.log("🔄 Connecting to WhatsApp...")

    // Clear corrupted sessions first
    clearCorruptedSession()

    // Check if session exists, if not download it
    const sessionExists = fs.existsSync(path.join(SESSION_DIR, "creds.json"))
    const downloaded = sessionExists ? true : await downloadSession()
    if (!downloaded) {
      console.log("❌ Failed to download session. Please check your SESSION_ID.")
      return
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
    const { version } = await fetchLatestBaileysVersion()

    conn = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Safari"), // Changed from Firefox to Safari
      syncFullHistory: false, // Changed to false to reduce load
      auth: state,
      version,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false, // Prevent immediate online status
      emitOwnEvents: false,
      getMessage: async (key) => {
        return { conversation: "Hello" }
      },
    })

    // Enhanced connection update handler
    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update

      if (qr) {
        console.log("📱 QR Code generated. Please scan with WhatsApp.")
        qrcode.generate(qr, { small: true })
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        console.log("⚠️ Connection closed. Status:", statusCode)
        console.log(
          "📊 Disconnect reason:",
          Object.keys(DisconnectReason)[Object.values(DisconnectReason).indexOf(statusCode)],
        )

        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)

          // Progressive delay
          const delay = Math.min(5000 * reconnectAttempts, 30000)
          setTimeout(() => connectToWA(), delay)
        } else if (statusCode === DisconnectReason.loggedOut) {
          console.log("🚪 Logged out. Clearing session...")
          clearCorruptedSession()
          console.log("❌ Please update your SESSION_ID and restart")
        } else {
          console.log("❌ Max reconnection attempts reached. Please restart manually.")
        }
      } else if (connection === "open") {
        reconnectAttempts = 0 // Reset on successful connection
        console.log("✅ Bot connected to WhatsApp successfully!")

        try {
          // Load plugins
          console.log("🔌 Loading plugins...")
          const pluginDir = path.join(__dirname, "plugins")
          if (fs.existsSync(pluginDir)) {
            fs.readdirSync(pluginDir).forEach((plugin) => {
              if (path.extname(plugin).toLowerCase() === ".js") {
                try {
                  require(path.join(pluginDir, plugin))
                } catch (pluginError) {
                  console.error(`❌ Failed to load plugin ${plugin}:`, pluginError.message)
                }
              }
            })
          }
          console.log("✅ Plugins loaded successfully")

          // Send startup message
          const startupMessage = `*🤖 Bot Connected Successfully!*

*Prefix:* ${prefix}
*Status:* Online ✅
*Version:* 1.0.0

> Bot is ready to use!`

          await conn.sendMessage(conn.user.id, {
            text: startupMessage,
          })
        } catch (error) {
          console.error("❌ Post-connection setup error:", error.message)
        }
      }
    })

    // Enhanced creds update with error handling
    conn.ev.on("creds.update", async () => {
      try {
        await saveCreds()
      } catch (error) {
        console.error("❌ Failed to save credentials:", error.message)
      }
    })

    // Message handler with better error handling
    conn.ev.on("messages.upsert", async (mek) => {
      try {
        await handleMessage(mek)
      } catch (error) {
        console.error("❌ Message handling error:", error.message)
      }
    })
  } catch (err) {
    console.error("❌ Connection failed:", err.message)

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      console.log(`🔄 Retrying connection in 10 seconds... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
      setTimeout(() => connectToWA(), 10000)
    }
  }
}

// Enhanced message handler
async function handleMessage(mek) {
  mek = mek.messages[0]
  if (!mek.message) return

  try {
    mek.message =
      getContentType(mek.message) === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message

    // Basic message processing
    const from = mek.key.remoteJid
    const body =
      mek.message.conversation ||
      mek.message.extendedTextMessage?.text ||
      mek.message.imageMessage?.caption ||
      mek.message.videoMessage?.caption ||
      ""

    const isCmd = body.startsWith(prefix)
    const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : ""

    // Auto-read messages if enabled
    if (config.READ_MESSAGE === "true") {
      await conn.readMessages([mek.key])
    }

    // Status auto-react
    if (mek.key?.remoteJid === "status@broadcast" && config.AUTO_STATUS_REACT === "true") {
      const emojis = ["❤️", "👍", "🔥", "💯", "✨", "🎉"]
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      await conn.sendMessage(
        mek.key.remoteJid,
        {
          react: { text: randomEmoji, key: mek.key },
        },
        { statusJidList: [mek.key.participant] },
      )
    }

    // Basic command handling
    if (isCmd) {
      switch (command) {
        case "ping":
          await conn.sendMessage(from, { text: "🏓 Pong!" }, { quoted: mek })
          break
        case "status":
          await conn.sendMessage(
            from,
            {
              text: `*Bot Status:* ✅ Online\n*Uptime:* ${process.uptime().toFixed(2)}s`,
            },
            { quoted: mek },
          )
          break
      }
    }
  } catch (error) {
    console.error("❌ Message processing error:", error.message)
  }
}

// Express server
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "WhatsApp Bot is running",
    uptime: process.uptime(),
  })
})

app.listen(port, "0.0.0.0", () => {
  console.log(`🌐 Server listening on http://0.0.0.0:${port}`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully...")
  if (conn) {
    conn.end()
  }
  process.exit(0)
})

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
})

// Start connection after delay
setTimeout(() => {
  connectToWA()
}, 3000)
