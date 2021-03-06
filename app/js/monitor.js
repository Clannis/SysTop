const path = require('path')
const { ipcRenderer } = require('electron')
const bytes = require('bytes');
const pretty = require('prettysize');
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload
let memOverload
let alertFrequency

// Get settings & values
ipcRenderer. on('settings:get', (e, settings) => {
    cpuOverload = +settings.cpuOverload
    memOverload = +settings.memOverload
    alertFrequency = +settings.alertFrequency
})

// Run every 2 seconds
setInterval(() => {
    // CPU Usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info.toFixed(2) + '%'

        document.getElementById('cpu-progress').style.width = info.toFixed(2) +'%'

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

    // Mem Used
    mem.used().then( info => {
        document.getElementById('mem-usage').innerText = `${pretty(bytes(`${info.usedMemMb}mb`))} or ${(info.usedMemMb / info.totalMemMb * 100).toFixed(2)}%`
        document.getElementById('mem-progress').style.width = (info.usedMemMb / info.totalMemMb * 100) +'%'

        // Make progress bar red if overload
        if ((info.usedMemMb / info.totalMemMb * 100) >= memOverload) {
            document.getElementById('mem-progress').style.background = 'red'
        } else {
            document.getElementById('mem-progress').style.background = '#30c88b'
        }

        // Check overload
        if ((info.usedMemMb / info.totalMemMb * 100) >= memOverload && runNotify(alertFrequency)) {
            notifyUser({
                title: 'Memory Overload',
                body: `Memory is over ${memOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png')
            })

            // Log timestamp of when last notified
            localStorage.setItem('lastNotify', +new Date())
        }
    })

    // Mem Free
    mem.free().then( info => {
        document.getElementById('mem-free').innerText = `${pretty(bytes(`${info.freeMemMb}mb`))} or ${(info.freeMemMb / info.totalMemMb * 100).toFixed(2)}%`
    })

    //Uptime
    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())
}, 2000)

// Set model
document.getElementById('cpu-model').innerText = cpu.model()

// Computer Name
document.getElementById('comp-name').innerText = os.hostname().split('.')[0]

// Set OS
os.oos().then((info) => {
    document.getElementById('os').innerText = `${info}`
})
// document.getElementById('os').innerText = `${os.type() === 'Darwin' ? 'MacOS' : os.type() === 'Win' ? 'Windows' : 'Linux'} ${os.arch()}`

// Set Mem
mem.info().then(info => {
    document.getElementById('mem-total').innerText = pretty(bytes(`${info.totalMemMb}mb`))
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