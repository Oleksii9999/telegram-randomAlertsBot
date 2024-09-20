import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Function to increase the speed of the audio file
export const changeAudioSpeed = (inputFile, outputFile, callback) => {
    const inputFilePath = path.join(process.cwd(), inputFile);
    const outputFilePath = path.join(process.cwd(), outputFile);
    ffmpeg(inputFilePath)
        .audioFilters([`asetrate=44100*0.62,aresample=44100`, 'bass=g=24', "treble=g=5", "equalizer=f=1000:t=q:w=200:g=5"])
        .save(outputFilePath)
        .on('end', () => {
            callback()
        })
        .on('error', (err) => {
        console.error('Error occurred:', err);
        });
};
