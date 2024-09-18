import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Function to increase the speed of the audio file
export const changeAudioSpeed = (inputFile, outputFile, speedFactor, callback) => {
    const inputFilePath = path.join(process.cwd(), inputFile);
    const outputFilePath = path.join(process.cwd(), outputFile);
    ffmpeg(inputFilePath)
        .audioFilters(`atempo=${speedFactor}`)
        .save(outputFilePath)
        .on('end', () => {
            callback()
        })
        .on('error', (err) => {
        console.error('Error occurred:', err);
        });
};
