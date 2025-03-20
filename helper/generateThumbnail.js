import generateFast from './generateFast.js'
import Ffmpeg from 'fluent-ffmpeg';

function generateThumbnail(path, filename, newFileName) {
  // Ffmpeg.setFfmpegPath('C:\\Users\\aayus\\Downloads\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe')
  // Generate the thumbnail

  Ffmpeg.ffprobe(`public/videos/${path}`, (err, metadata) => {
    if (metadata) {
      const duration = metadata.format.duration
      const timestamps = [
         duration / 4, duration / 2, 3*duration / 4, duration-1
      ]
        Ffmpeg(`public/videos/${path}`)
          .screenshots({
            timestamps: [...timestamps], // Capture a thumbnail at 1 second into the video
            filename: `${filename}-%i.jpg`, // Generate a unique filename
            folder: 'public/thumbnails',
            size: "320x180"
          })
          .on('end', () => {
            // console.log('Thumbnail generated successfully.');
            // generateFast(path, newFileName)
          })
          .on('error', (err) => {
            console.error('Error generating thumbnail:', err);
          });
    }
  })

  // Ffmpeg(`public/videos/${path}`)
  // .screenshots({
  //   timestamps: [1], // Capture a thumbnail at 1 second into the video
  //   filename: `${filename}.jpg`, // Generate a unique filename
  //   folder: 'public/thumbnails',
  //   size:"320x180"
  // })
  //   .on('end', () => {
  //     // console.log('Thumbnail generated successfully.');
  //     // generateFast(path, newFileName)
  //   })
  //   .on('error', (err) => {
  //     console.error('Error generating thumbnail:', err);
  //   });

}

export default generateThumbnail