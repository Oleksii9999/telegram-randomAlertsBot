import { model, Schema, SchemaType } from "mongoose";

const MessageSchema = Schema({
    id : {
        type : Schema.Types.ObjectId
    },
    telegramUserMessageId : {
        required : true,
        type : Number
    },
    message : {
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