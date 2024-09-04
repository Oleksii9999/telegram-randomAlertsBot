import { connect } from "mongoose"

const url = process.env.MONGODB_URL

export const connectToDatabase = async () => {
    try {
        connect(url)
        console.log("MongoDB Connected")
    }
    catch(err) {
        console.log('Database Error : ' + err)
    }
}