const path = require('path')
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload = 80
let alertFrequency = 1

// Run every 2 seconds
setInterval(() => {
    // CPU Usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info + '%'

        document.getElementById('cpu-progress').style.width = info +'%'

        // Make progress bar red if overload
        if (info >= cpuOverload) {
            document.getElementById('cpu-progress').style.background = 'red'
        } else {
            document.getElementById('cpu-progress').style.background = '#30c88b'
        }

        // Check overload
        if (info >= cpuOverload && runNotify(alertFrequency)) {
            notifyUser({
                title: 'CPU Overload',
                body: `CPU is over ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png')
            })

            // Log timestamp of when last notified
            localStorage.setItem('lastNotify', +new Date())
        }
    })

    // CPU Free
    cpu.free().then(info => {
        document.getElementById('cpu-free').innerText = info + '%'
    })

    //Uptime
    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())
}, 2000)

// Set model
document.getElementById('cpu-model').innerText = cpu.model()

// Computer Name
document.getElementById('comp-name').innerText = os.hostname()

// Set OS
document.getElementById('os').innerText = `${os.type() === 'Darwin' ? 'MacOS' : os.type() === 'Win' ? 'Windows' : 'Linux'} ${os.arch()}`

// Set Mem
mem.info().then(info => {
    document.getElementById('mem-total').innerText = info.totalMemMb
})

// Show DHMS
function secondsToDhms(seconds) {
    seconds = +seconds
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24) ) / 3600)
    const m = Math.floor((seconds % 3600) /60)
    const s = Math.floor(seconds % 60)
    return `${d} Days, ${h}:${m}:${s}`
}

// Send notification
function notifyUser(options) {
    new Notification(options.title, options)
}

// Check how much time has passed since notification
function runNotify(frequency) {
    if (localStorage.getItem('lastNotify') === null) {
        // Store Timestamp
        localStorage.setItem('lastNotify', +new Date())
        return true
    } 
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000*60))
    if (minutesPassed > frequency) {
        return true
    } else {
        return false
    }
}