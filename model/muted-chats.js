import mongoose, {model, Schema} from "mongoose"

const muteSchema = Schema({
    chatID : {
        type  : String,
        required : true
    }
})

const MutedChats = mongoose.models.MutedChats || model("MutedChat", muteSchema)

export default MutedChats