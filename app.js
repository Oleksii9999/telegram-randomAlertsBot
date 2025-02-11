import { configDotenv } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { encrypt, decrypt } from "./encryption.js";
import isUrl from "is-url";
import chat from "./genai.js";
import { connectToDatabase } from "./config.js";
import { addToConversationHistory, getConversationHistory } from "./userHistory.js";
import { 
  search, 
  // import the result types you want
  OrganicResult, 
  DictionaryResult,
  // helpful to import ResultTypes to filter results
  ResultTypes 
} from 'google-sr';
import gTTS from "gtts"
import { changeAudioSpeed } from "./audo-editor.js";
import { generate } from "randomstring";
import fs from "fs"
import { markdownToHtml } from 'marksmithjs';


configDotenv()
connectToDatabase()


const token = process.env.KEY;
const botID = 7123617877

const bot = new TelegramBot(token, {polling: true});

const sendMessage = (chatId, text, options = {}) => {
  bot.sendMessage(chatId, text, options)
    .then()
    .catch((error) => {
      console.error('Failed to send message:', error);
    });
};

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: '🎲 Random', callback_data: 'random' }],
        //[{ text: '😎 share contact with robot', request_contact: true }],
        //[{ text: '🙌 share location with robot', request_location: true }]
      ]
    }
  };

  sendMessage(chatId, 
`
Welcome to @gideon_from_2024_bot Bot.
This is just a random bot.
Opps! 😎😎

You can choose any of these options
send /help for list of commands
use /ask or send a message containing "gideon" to chat with the AI
`
);
});


bot.onText(/@voice/, async (msg, match) => {
  const chatId = msg.chat.id;
  
  let input = msg.text
  const userID = msg.from.id
  
  const history = await getConversationHistory(userID)

  const response = await chat(input, history)

  const speech = new gTTS(response, "en-uk", false)
  const inVoice = generate(9)
  const outVoice = generate(9)

  speech.save(`./${inVoice}.mp3`, async (err, result) => {

    changeAudioSpeed(`./${inVoice}.mp3`, `./${outVoice}.mp3`, async () => {
      try {
        bot.sendVoice(chatId, `./${outVoice}.mp3`, {reply_to_message_id : msg.message_id})
        await addToConversationHistory(userID, input, "user")
        await addToConversationHistory(userID, response, "model")
      }
      catch(err) {
        sendMessage(chatId, 
`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a>
${markdownToHtml(response)}


Could not send as a voice message
`, {parse_mode : "HTML"})
        await addToConversationHistory(userID, input, "user")
        await addToConversationHistory(userID, response, "model")
      }
      finally {
        fs.unlink(`./${inVoice}.mp3`, (err) => {
          if (err) {
            return;
          }
        });
        fs.unlink(`./${outVoice}.mp3`, (err) => {
          if (err) {
            return;
          }
        });
      }
    })
  })
});

bot.onText(/\/google (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = msg.text.substring(7).trim()
  const results = await search({
      query: input,
      // OrganicResult is the default, however it is recommended to ALWAYS specify the result type
      resultTypes: [OrganicResult],
      // to add additional configuration to the request, use the requestConfig option
      // which accepts a AxiosRequestConfig object
      // OPTIONAL
      requestConfig: {
      params: {
              // enable "safe mode"
        safe: 'active'
      },
    },
  })
  let message = `<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ~  here are your search results:\n\n\n`
  results.forEach(element => {
      message += "\n" + element.title ?? "" + "\n"
      message += element.link ?? "" + "\n"
      message += element.description ?? "" + "\n"
      message += "\n\n"
  });
  return sendMessage(chatId, markdownToHtml(message), {parse_mode : "HTML"})
});


bot.onText(/\/url (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const link = decrypt(match[1])
  if(link && isUrl(link)) {
    return sendMessage(chatId,
`
Link from <a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a>


<a href="${link}" >Link</a>
` , {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'visit link', callback_data: 'link', url : link }],
    ]
  }, parse_mode : "HTML", reply_to_message_id: msg.message_id
})
  }
});


bot.onText(/ask (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  const prompt = match[1].trim()
  const response = await chat(prompt)
  return sendMessage(chatId, 
`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a>
${markdownToHtml(response)}
`, {parse_mode : "HTML"})
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const ignoringCommands = ["/url","/ask","/google", "@voice"]
  const triggerWords = [
    "gideon",
    // Greetings
    /*
    "hi", 
    "hello", 
    "hey", 
    "good morning", 
    "good afternoon", 
    "good evening", 
    "what's up", 
    "howdy", 
    "greetings", 
    "sup",
    
    // Cry for Help
    "help", 
    "please help", 
    "i need help", 
    "can someone help", 
    "emergency", 
    "i'm in trouble", 
    "i need assistance", 
    "help me", 
    "sos", 
    "save me", 
  
    // Common Questions/Statements
    "anyone here?", 
    "is anyone there?", 
    "i'm new here", 
    "how are you?", 
    "hru", 
    "what's going on?", 
    "what's happening?", 
    "where is everyone?", 
    "can you help me?", 
    "i need advice",
    
    // Expressions of Emotion
    "i'm sad", 
    "i'm happy", 
    "i feel lonely", 
    "i'm angry", 
    "i'm scared", 
    "i'm excited", 
    "i'm confused", 
    "i'm lost", 
    "i'm frustrated", 
    "i need a friend"
    */
  ];

  if(msg.text === undefined || msg.text === "/start" || msg.text === "/google" || ignoringCommands.some( c => msg.text.startsWith(c)) || msg.contact || msg.location)
    return
  else if(msg.text.toLowerCase() === "/help") {
    return sendMessage(chatId, 
`
Here is a list of all commands
/start - Start / View robots options
/google - Search google with the bot
/help - view all bot's commands
/ask - Use generative AI
@voice - for the ai to use voice messages
`
    )
  }
  
  else if(msg.chat.type === "private") {
    let input = msg.text
    const userID = msg.from.id
    const history = await getConversationHistory(userID)
    const response = await chat(input, history)

    try {
      sendMessage(chatId, `${response}`, {reply_to_message_id : msg.message_id})
      await addToConversationHistory(userID, input, "user")
      await addToConversationHistory(userID, response, "model")
      return
    }
    catch(err) {
      sendMessage(chatId, 
`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a>
${markdownToHtml(response)}
`, {parse_mode : "HTML"})
      await addToConversationHistory(userID, input, "user")
      await addToConversationHistory(userID, response, "model")
      return
    }
  }
  else if(triggerWords.some( word => msg.text.toLowerCase().includes(word)) || (msg.reply_to_message && msg.reply_to_message.from.id === botID)) {
    let input = msg.text
    const userID = msg.from.id
    const history = await getConversationHistory(userID)
    const response = await chat(input, history)

    try {
      sendMessage(chatId, `${response}`, {reply_to_message_id : msg.message_id})
      await addToConversationHistory(userID, input, "user")
      await addToConversationHistory(userID, response, "model")
      return
    }
    catch(err) {
      sendMessage(chatId, 
`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a>
${markdownToHtml(response)}
`, {parse_mode : "HTML"})
      await addToConversationHistory(userID, input, "user")
      await addToConversationHistory(userID, response, "model")
      return
    }
  }
  else {
    /**/return
  }
});

bot.on("contact", (msg) => {
  const chatId = msg.chat.id;
  sendMessage(chatId, 'Your number has been received');
})

bot.on("location", (msg) => {
  const chatId = msg.chat.id;
  sendMessage(chatId, "Wow, you are from : " + msg.location.latitude)
})

bot.on('inline_query', (query) => {
  if(isUrl(query.query))
    return bot.answerInlineQuery(query.id, [{
      id: 0,
      type : "article",
      title:  "🔗🔏 URL",
      description: "You are sending an encrypted link :",
      message_text: "/url " + encrypt(query.query),
      url : query.query,
  }]);
  return bot.answerInlineQuery(query.id, []);
});

bot.on("polling_error", (err) => {
    console.error(err)
})

console.info("Robot online")