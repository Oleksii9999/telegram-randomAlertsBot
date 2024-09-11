import gTTS from "gtts"

const speech = new gTTS(
`
Oh wow, That's nice.
`, "en-uk", false)

speech.save("./hello.mp3", (err, result) => {
    if(err) {
        return console.error(err)
    }
    console.log("successful")
})