import Ffmpeg from 'fluent-ffmpeg';
import fs from 'fs'
import WebtorrentClient from './webtorrent.js';
import Videos from '../models/video.model.js';

function generateFast(oldpath, newpath) {
    // Ffmpeg.setFfmpegPath('C:\\Users\\aayus\\Downloads\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe')
    Ffmpeg(`public/videos/${oldpath}`)
        .outputOptions([
            '-movflags +faststart', // Optimize for web streaming
            '-c copy' //copy everything
        ])
        .save(`public/videos/${newpath}`)
        .on('end', () => {
            //now seed
            WebtorrentClient.seed('./public/videos/'+ newpath , async (torrent) => {
                    await Videos.update(
                        {
                            infoHash : torrent.magnetURI
                        },
                        {
                            where : {
                                videoPath : newpath
                            }
                        }
                    )
            })

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