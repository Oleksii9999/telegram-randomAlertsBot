import { model, Schema, } from "mongoose";

const MessageSchema = Schema({
    telegramUserMessageId : {
        required : true,
        type : Number
    },
    text : {
        type : String,
        required : true
    },
    from : {
        type : String,
        required : true,
        enums : ["user", "model"]
    }
}, {timestamps : true})

const Chat = model("Message", MessageSchema)

export default Chat