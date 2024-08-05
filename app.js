import { configDotenv } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import googleIt from "google-it"

configDotenv()

const token = process.env.KEY;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: '😊 Random', callback_data: 'button1' }],
        [{ text: '😎 share contact with robot', request_contact: true }],
        [{ text: '🙌 share location with robot', request_location: true }]
      ]
    }
  };

  bot.sendMessage(chatId, 
`
Welcome to @gideon_from_2024_bot Bot.
This is just a random bot.
Opps! 😎😎

You can choose any of these options
send /help for list of commands
`
  , options);
});

bot.onText(/\/google/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 
`
To search on google send *google what you want to search*
e.g : google Gideon from flash
`
  );
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if(msg.text === "/start" || msg.text === "/google")
    return
  else if(msg.text.toLowerCase() === "/help") {
    return bot.sendMessage(chatId, )
  }

  if(msg.text.toLowerCase().startsWith("google")) {
    const search = msg.text.substring(6).trim()
    googleIt({'query': search}).then(results => {
        if(Array.isArray(results)) {
            let message = "Your search results:\n\n\n"
            results.forEach(element => {
                message += element.title + "\n"
                message += element.link + "\n"
                message += element.snippet + "\n"
                message += "\n\n"
            });
            return bot.sendMessage(chatId, message)
        }
      }).catch(e => {
        console.log(e)
        bot.sendMessage(chatId, "Something went wrong")
      })
    return
  }
  

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});

bot.on("callback_query", (query) => {
    console.log(query.message.chat)
    chatId = query.message.chat.id;

})