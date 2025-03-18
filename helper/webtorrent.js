import WebTorrent from 'webtorrent'
import events from 'events'
events.EventEmitter.defaultMaxListeners = Infinity;

const WebtorrentClient = new WebTorrent({maxConns : 5, dht : false})

export default WebtorrentClient