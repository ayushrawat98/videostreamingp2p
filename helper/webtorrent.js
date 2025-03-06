import WebTorrent from 'webtorrent'

const WebtorrentClient = new WebTorrent()
WebtorrentClient.setMaxListeners(Infinity)
export default WebtorrentClient