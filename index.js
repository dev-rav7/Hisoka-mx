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
  Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./settings')
const GroupEvents = require('./lib/groupevents')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type')
const axios = require('axios')
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['263780934873']

// Optimisation du cache temporaire
const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const clearTempDir = () => {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(tempDir, file))
        } catch (err) {
          console.error('Erreur lors de la suppression du fichier:', err)
        }
      })
    }
  } catch (err) {
    console.error('Erreur lors du nettoyage du répertoire temporaire:', err)
  }
}

// Nettoyage plus fréquent pour éviter l'accumulation
setInterval(clearTempDir, 2 * 60 * 1000) // Toutes les 2 minutes

//===================SESSION-AUTH============================
const initializeSession = async () => {
  try {
    if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
      if (!config.SESSION_ID) {
        throw new Error('Please add your session to SESSION_ID env !!')
      }
      
      const sessdata = config.SESSION_ID.replace("Wa~", '')
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      
      return new Promise((resolve, reject) => {
        filer.download((err, data) => {
          if (err) reject(err)
          else {
            fs.writeFileSync(__dirname + '/sessions/creds.json', data)
            console.log("[ 📥 ] Session downloaded ✅")
            resolve()
          }
        })
      })
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session:', error)
    throw error
  }
}

const express = require("express")
const app = express()
const port = process.env.PORT || 9090

let conn // ✅ GLOBAL conn declaration
let reconnectAttempts = 0
const maxReconnectAttempts = 5
let isConnecting = false

//=============================================

async function connectToWA() {
  if (isConnecting) return
  isConnecting = true
  
  try {
    console.log("[ ♻ ] Connecting to WhatsApp ⏳️...")
    
    // Initialiser la session avant de se connecter
    await initializeSession()

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    const { version } = await fetchLatestBaileysVersion()

    conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: false, // Optimisation: évite de synchroniser tout l'historique
      auth: state,
      version,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        return {
          conversation: "Bot Message"
        }
      },
      // Optimisations de performance
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
      qrTimeout: 45000,
      emitOwnEvents: false,
      fireInitQueries: true,
      maxMsgRetryCount: 3,
      retryRequestDelayMs: 3000,
      transactionOpts: {
        maxCommitRetries: 10,
        delayBetweenTriesMs: 3000
      }
    })

    // Gestion des événements de connexion
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log('[ 📱 ] QR Code generated. Please scan with WhatsApp.')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        const statusCode = lastDisconnect?.error?.output?.statusCode
        
        console.log('[ ⚠️ ] Connection closed. Status Code:', statusCode)
        
        if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          console.log(`[ ♻️ ] Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`)
          
          // Délai progressif de reconnexion
          const delay = Math.min(5000 * reconnectAttempts, 30000)
          setTimeout(() => {
            isConnecting = false
            connectToWA()
          }, delay)
        } else {
          console.log('[ ❌ ] Max reconnection attempts reached or logged out')
          reconnectAttempts = 0
          isConnecting = false
        }
      } else if (connection === 'open') {
        try {
          reconnectAttempts = 0 // Reset counter on successful connection
          isConnecting = false
          
          console.log('[ 🧬 ] Installing Plugins')

          // Installation des plugins de manière asynchrone
          const pluginFiles = fs.readdirSync("./plugins/")
            .filter(plugin => path.extname(plugin).toLowerCase() === ".js")
          
          for (const plugin of pluginFiles) {
            try {
              require("./plugins/" + plugin)
            } catch (error) {
              console.error(`Erreur lors du chargement du plugin ${plugin}:`, error)
            }
          }

          console.log('[ ✔ ] Plugins installed successfully ✅')
          console.log('[ 🪀 ] Bot connected to WhatsApp 📲')

          // Message de connexion optimisé
          const connectionMessage = `*Hello there 『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 connected! 👋🏻* 

*Keep on using 『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』🚩* 

- *Your bot prefix: ➡️[ ${prefix} ]*
> - You can change your prefix using the ${prefix}prefix command

> Don't forget to share, star & fork the repo ⬇️ 
https://github.com/hhhisoka/Wa-his-v1.0

> © Powered by hhhisoka `

          await conn.sendMessage(conn.user.id, { 
            image: { url: `https://files.catbox.moe/4c8ql3.jpg` }, 
            caption: connectionMessage 
          })

          // Suivi du canal de manière sécurisée
          try {
            const channelJid = "120363400575205721@newsletter"
            await conn.newsletterFollow(channelJid)
            console.log(`Successfully followed channel: ${channelJid}`)
          } catch (error) {
            console.error(`Failed to follow channel:`, error.message)
          }

        } catch (error) {
          console.error("[ ❌ ] Error during post-connect setup:", error)
        }
      }
    })

    conn.ev.on('creds.update', saveCreds)

    // Gestion des erreurs de connexion
    conn.ev.on('connection.error', (error) => {
      console.error('[ ❌ ] Connection error:', error)
    })

  } catch (err) {
    console.error("[ ❌ ] Connection failed:", err)
    isConnecting = false
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++
      setTimeout(() => connectToWA(), 10000)
    }
  }

  // Gestion des événements de manière plus robuste
  if (conn) {
    setupEventHandlers()
  }
}

function setupEventHandlers() {
  // Anti-delete avec gestion d'erreur
  conn.ev.on('messages.update', async (updates) => {
    try {
      for (const update of updates) {
        if (update.update.message === null) {
          console.log("Delete Detected")
          await AntiDelete(conn, [update]).catch(console.error)
        }
      }
    } catch (error) {
      console.error('Erreur dans messages.update:', error)
    }
  })

  // Gestion des événements de groupe
  conn.ev.on("group-participants.update", (update) => {
    try {
      GroupEvents(conn, update)
    } catch (error) {
      console.error('Erreur dans group-participants.update:', error)
    }
  })

  // Gestion des messages entrants
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      await handleIncomingMessage(mek)
    } catch (error) {
      console.error('Erreur dans messages.upsert:', error)
    }
  })
}

async function handleIncomingMessage(mek) {
  mek = mek.messages[0]
  if (!mek.message) return

  mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
    ? mek.message.ephemeralMessage.message 
    : mek.message

  // Lecture des messages si configuré
  if (config.READ_MESSAGE === 'true') {
    try {
      await conn.readMessages([mek.key])
      console.log(`Marked message from ${mek.key.remoteJid} as read.`)
    } catch (error) {
      console.error('Erreur lors de la lecture du message:', error)
    }
  }

  // Gestion des messages view once
  if (mek.message.viewOnceMessageV2) {
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
      ? mek.message.ephemeralMessage.message 
      : mek.message
  }

  // Gestion des statuts
  if (mek.key && mek.key.remoteJid === 'status@broadcast') {
    await handleStatusMessage(mek)
  }

  // Sauvegarde du message de manière asynchrone
  try {
    await saveMessage(mek)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du message:', error)
  }

  // Traitement des commandes
  await processMessage(mek)
}

async function handleStatusMessage(mek) {
  try {
    if (config.AUTO_STATUS_SEEN === "true") {
      await conn.readMessages([mek.key])
    }

    if (config.AUTO_STATUS_REACT === "true") {
      const ravlike = await conn.decodeJid(conn.user.id)
      const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      await conn.sendMessage(mek.key.remoteJid, {
        react: {
          text: randomEmoji,
          key: mek.key,
        } 
      }, { statusJidList: [mek.key.participant, ravlike] })
    }

    if (config.AUTO_STATUS_REPLY === "true") {
      const user = mek.key.participant
      const text = config.AUTO_STATUS_MSG || "Status seen! 👀"
      await conn.sendMessage(user, { 
        text: text, 
        react: { text: '💜', key: mek.key } 
      }, { quoted: mek })
    }
  } catch (error) {
    console.error('Erreur lors du traitement du statut:', error)
  }
}

async function processMessage(mek) {
  const m = sms(conn, mek)
  const type = getContentType(mek.message)
  const content = JSON.stringify(mek.message)
  const from = mek.key.remoteJid
  const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
  const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
  const isCmd = body.startsWith(prefix)
  const budy = typeof mek.text == 'string' ? mek.text : false
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const args = body.trim().split(/ +/).slice(1)
  const q = args.join(' ')
  const text = args.join(' ')
  const isGroup = from.endsWith('@g.us')
  const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
  const senderNumber = sender.split('@')[0]
  const botNumber = conn.user.id.split(':')[0]
  const pushname = mek.pushName || 'User'
  const isMe = botNumber.includes(senderNumber)
  const isOwner = ownerNumber.includes(senderNumber) || isMe
  const botNumber2 = await jidNormalizedUser(conn.user.id)
  const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
  const groupName = isGroup ? groupMetadata?.subject || '' : ''
  const participants = isGroup ? groupMetadata?.participants || [] : []
  const groupAdmins = isGroup ? await getGroupAdmins(participants) : []
  const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
  const isAdmins = isGroup ? groupAdmins.includes(sender) : false
  const isReact = m.message.reactionMessage ? true : false
  
  const reply = (teks) => {
    conn.sendMessage(from, { text: teks }, { quoted: mek })
  }

  // Gestion des commandes d'évaluation pour les créateurs
  await handleEvalCommands(mek, budy, isOwner, reply)

  // Gestion des réactions automatiques
  await handleAutoReact(mek, senderNumber, isReact)

  // Vérification du mode de fonctionnement
  if (!isOwner && config.MODE === "private") return
  if (!isOwner && isGroup && config.MODE === "inbox") return
  if (!isOwner && !isGroup && config.MODE === "groups") return

  // Traitement des commandes
  await handleCommands(mek, m, {
    from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, 
    botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, 
    groupAdmins, isBotAdmins, isAdmins, reply
  })
}

async function handleEvalCommands(mek, budy, isOwner, reply) {
  if (!isOwner) return

  try {
    if (mek.text && mek.text.startsWith('%')) {
      const code = budy.slice(2)
      if (!code) {
        reply('Provide me with a query to run Master!')
        return
      }
      
      const resultTest = eval(code)
      reply(util.format(resultTest))
      return
    }

    if (mek.text && mek.text.startsWith('$')) {
      const code = budy.slice(2)
      if (!code) {
        reply('Provide me with a query to run Master!')
        return
      }
      
      const resultTest = await eval('const a = async()=>{\n' + code + '\n}\na()')
      const h = util.format(resultTest)
      if (h !== undefined) reply(h)
      return
    }
  } catch (err) {
    reply(util.format(err))
  }
}

async function handleAutoReact(mek, senderNumber, isReact) {
  if (isReact) return

  try {
    // Réaction spéciale pour le propriétaire
    if (senderNumber.includes("2250104610403")) {
      const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", "💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"]
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
      await conn.sendMessage(mek.key.remoteJid, {
        react: { text: randomReaction, key: mek.key }
      })
      return
    }

    // Réaction automatique si configurée
    if (config.AUTO_REACT === 'true') {
      const reactions = ['🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '🇵🇰']
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
      await conn.sendMessage(mek.key.remoteJid, {
        react: { text: randomReaction, key: mek.key }
      })
    }

    // Réaction personnalisée si configurée
    if (config.CUSTOM_REACT === 'true') {
      const reactions = (config.CUSTOM_REACT_EMOJIS || '🙂,😔').split(',')
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
      await conn.sendMessage(mek.key.remoteJid, {
        react: { text: randomReaction, key: mek.key }
      })
    }
  } catch (error) {
    console.error('Erreur lors de la réaction automatique:', error)
  }
}

async function handleCommands(mek, m, context) {
  try {
    const events = require('./hisoka')
    const { body, isCmd } = context
    const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false
    
    if (isCmd) {
      const cmd = events.commands.find((cmd) => cmd.pattern === cmdName) || 
                  events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
      
      if (cmd) {
        if (cmd.react) {
          await conn.sendMessage(context.from, { 
            react: { text: cmd.react, key: mek.key }
          })
        }
        
        await cmd.function(conn, mek, m, context)
      }
    }

    // Gestion des événements basés sur le contenu
    for (const command of events.commands) {
      try {
        if (body && command.on === "body") {
          await command.function(conn, mek, m, context)
        } else if (mek.q && command.on === "text") {
          await command.function(conn, mek, m, context)
        } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
          await command.function(conn, mek, m, context)
        } else if (command.on === "sticker" && mek.type === "stickerMessage") {
          await command.function(conn, mek, m, context)
        }
      } catch (error) {
        console.error(`Erreur dans la commande ${command.pattern}:`, error)
      }
    }
  } catch (error) {
    console.error("[PLUGIN ERROR]", error)
  }
}

// Ajout des méthodes utilitaires au conn
function addUtilityMethods(conn) {
  conn.decodeJid = jid => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

  conn.getName = (jid, withoutContact = false) => {
    const id = conn.decodeJid(jid)
    withoutContact = conn.withoutContact || withoutContact
    let v
    if (id.endsWith('@g.us')) {
      return new Promise(async resolve => {
        v = store.contacts[id] || {}
        if (!(v.name || v.notify || v.subject)) {
          v = await conn.groupMetadata(id) || {}
        }
        resolve(v.name || v.subject || id)
      })
    } else {
      v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : 
          id === conn.decodeJid(conn.user.id) ? conn.user : 
          store.contacts[id] || {}
      return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || id
    }
  }

  conn.sendText = (jid, text, quoted = '', options) => 
    conn.sendMessage(jid, { text: text, ...options }, { quoted })

  conn.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path : 
                 /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') : 
                 /^https?:\/\//.test(path) ? await getBuffer(path) : 
                 fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
    return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
  }
}

// Configuration du serveur Express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error)
})

// Route de base
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "『𝙒𝘼・𝙃𝙄𝙎・𝙑𝟭』 STARTED ✅",
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: conn ? "connected" : "disconnected",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    reconnectAttempts: reconnectAttempts
  })
})

// Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port http://0.0.0.0:${port}`)
})

// Démarrage de la connexion WhatsApp avec délai
setTimeout(() => {
  connectToWA()
}, 3000)

// Nettoyage périodique de la mémoire
setInterval(() => {
  if (global.gc) {
    global.gc()
  }
}, 30000) // Toutes les 30 secondes