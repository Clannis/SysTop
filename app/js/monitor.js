const path = require('path')
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

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
