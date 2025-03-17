import WebTorrent from 'webtorrent'

const WebtorrentClientTemp = new WebTorrent()
const WebtorrentClient = WebtorrentClientTemp.setMaxListeners(0)

export default WebtorrentClient