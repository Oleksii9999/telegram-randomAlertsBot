import Chat from "./model/usermessages.js";
import { history as modelHistory } from "./genai.js";
const botID = 7123617877

export const getConversationHistory = async (userID) => {
    const history = await Chat.find({
        telegramUserMessageId : userID
    }, ).sort({"createdAt" : 1})
    if(!history)
        return modelHistory
    const chatTree = [...modelHistory]
    history.forEach(
        message => {
            chatTree.push({
                role: message.from,
                parts: [
                    {text: message.text + "\n"},
                ],
            })
        }
    )
    return chatTree
}

export const addToConversationHistory = async (userid, text, from) => {
    await Chat.create({
        telegramUserMessageId : userid,
        text : text,
        from : from
    })
}