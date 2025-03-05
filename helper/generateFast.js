import Ffmpeg from 'fluent-ffmpeg';
import fs from 'fs'

function generateFast(oldpath, newpath) {
    // Ffmpeg.setFfmpegPath('C:\\Users\\aayus\\Downloads\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe')
    Ffmpeg(`public/videos/${oldpath}`)
        .outputOptions([
            '-movflags +faststart', // Optimize for web streaming
            '-c copy' //copy everything
        ])
        .save(`public/videos/${newpath}`)
        .on('end', () => {
            // console.log('fast generated')
            fs.unlink(`public/videos/${oldpath}`, (err) => {
                if (err) {
                    fs.appendFile('./public/failed.txt', `delete /video/${oldpath}`, (err) => { })
                }
            })
        })
        .on('error', (err) => {
            console.error('Error generating fast:', err);
        });

}

export default generateFast