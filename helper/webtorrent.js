import WebTorrent from 'webtorrent'

const WebtorrentClient = new WebTorrent({maxConns : 5, dht : false})

export default WebtorrentClient