import { configDotenv } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import googleIt from "google-it"
import { generate } from "random-words";
import { encrypt, decrypt } from "./encryption.js";
import isUrl from "is-url";

configDotenv()

const token = process.env.KEY;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: '😊 Random', callback_data: 'random' }],
        //[{ text: '😎 share contact with robot', request_contact: true }],
        //[{ text: '🙌 share location with robot', request_location: true }]
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

bot.onText(/\/google (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const search = msg.text.substring(7).trim()
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
});


bot.onText(/hash-to-url:(.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const link = decrypt(match[1])
  if(link && isUrl(link)) {
    return bot.sendMessage(chatId,
`
Here is the hashed link from ${msg.from.first_name} - ${msg.from.id}
` , {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'link', callback_data: 'link', url : link }],
    ]
  }
})
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if(msg.text === "/start" || msg.text === "/google" || msg.contact || msg.location)
    return
  else if(msg.text.toLowerCase() === "/help") {
    return bot.sendMessage(chatId, 
`
Here is a list of all commands
/start - Start / View robots options
/google - Search google with the bot
/help - view all bot's commands
`
    )
  }
  else if(msg.text === "😊 Random") {
    return bot.sendMessage(chatId, "Here is a random word : " + generate())
  }
});

bot.on("contact", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Your number has been received');
})

bot.on("location", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Wow, you are from : " + msg.location.latitude)
})

bot.on('inline_query', (query) => {
  if(isUrl(query.query))
    return bot.answerInlineQuery(query.id, [{
      id: 0,
      type : "article",
      title: "e.g https://url.com",
      description: "When you choose this option, you would be able to send a hashed link to anygroup this bot is a member of. First paste the link you want to send here.",
      message_text: "hash-to-url:" + encrypt(query.query),
      url : query.query,
  }]);
  return bot.answerInlineQuery(query.id, [{
    id: 0,
    type : "article",
    title: "e.g https://url.com",
    description: "When you choose this option, you would be able to send a hashed link to anygroup this bot is a member of. First paste the link you want to send here.",
    message_text: "invalid link",
    url : "https://example.com",
}]);
});

/*bot.setWebHook('https://gideon-tg-bot.onrender.com', {
  certificate: process.cwd() + 'crt.pem',
});
*/

bot.on("polling_error", (err) => {
    console.error(err)
})

console.info("Robot online")