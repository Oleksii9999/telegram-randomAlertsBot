import { configDotenv } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import googleIt from "google-it"
import { generate } from "random-words";
import http from "http"

configDotenv()

const token = process.env.KEY;

export const handler = (() => {
  return http.createServer((req, res) => {
    const bot = new TelegramBot(token, {polling: true});
    
    bot.onText(/\/start/, (msg, match) => {
      const chatId = msg.chat.id;
    
      const options = {
        reply_markup: {
          keyboard: [
            [{ text: '😊 Random', callback_data: 'random' }],
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
    
     else if(msg.text.toLowerCase().startsWith("google")) {
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
      else if(msg.text === "😊 Random") {
        return bot.sendMessage(chatId, "Here is a random word : " + generate())
      }
      
      else if(!msg.text.startsWith("Your search result:"))
       return bot.sendMessage(chatId, 'Received your message. /help for all bot commands');
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
        googleIt({'query': query.query}).then(results => {
            if(Array.isArray(results)) {
                const inlineResponse = results.map(result => {
                    let message = "Your search result:\n\n\n"
                    message += result.title + "\n"
                    message += result.link + "\n"
                    message += result.snippet + "\n"
                    message += "\n\n"
                    return {
                        id: results.indexOf(result),
                        type: 'article',
                        title: result.title,
                        description: result.snippet,
                        message_text: message,
                        url : result.link,
                    }
                })
                return bot.answerInlineQuery(query.id, inlineResponse);
            }
          }).catch(e => {
            console.log(e)
          })
    });
  
    bot.setWebHook('https://gideon-tg-bot.vercel.app/', {
      certificate: process.cwd() + 'crt.pem',
    });
    
    bot.on("polling_error", (err) => {
        console.error(err)
    })


    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
  }).listen(4000, () => console.log(console.info("Robot online")))
})();

export default handler