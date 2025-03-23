import express from 'express'
import Videos from '../models/video.model.js'

const router = express.Router()

router.get('*', async (req, res, next) => {
    let latestVideos = await Videos.findAll({
        attributes: ['title', 'createdAt', 'infoHash'],
        order: [['createdAt', 'DESC']],
        limit: 20,
        distinct: true
    })

    if(latestVideos){
        const rssFeed = jsonToRSS(latestVideos.map(x => x.toJSON()))
        res.header('Content-Type', 'application/xml');
        res.send(rssFeed);
    }else{
        res.status(400).json({message : "No data available"})
    }

})

function escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

function jsonToRSS(jsonData) {

    let rssFeed = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rssFeed += `<rss version="2.0">\n`;
    rssFeed += `<channel>\n`;
    rssFeed += `<title>BharatTube</title>\n`;
    rssFeed += `<link>https://bharattube.xyz</link>\n`;
    rssFeed += `<description>Video sharing website for India</description>\n`;

    jsonData.forEach(item => {
        rssFeed += `<item>\n`;
        rssFeed += `<title>${item.title}</title>\n`;
        rssFeed += `<link>${escapeXML(item.infoHash)}</link>\n`;
        rssFeed += `<pubDate>${item.createdAt}</pubDate>\n`;
        rssFeed += `</item>\n`;
    });

    rssFeed += `</channel>\n`;
    rssFeed += `</rss>\n`;

    return rssFeed;
}

export default router