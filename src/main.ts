import './style.css'

import {
  Pt,
  CanvasSpace,
  Img,
  Range,
  Rectangle,
  Sound
} from 'pts'

import {
  chunk,
  mean,
  max
} from 'lodash'

const space = new CanvasSpace('#app')
const form = space.getForm()

let logo = new Img(true)
let sound : Sound
const maxBin = 256
const size = 400
const dimensions = new Pt(250, 250, 250, 250)

space.add({
  async start() {
    await logo.load("/assets/swingby_zwart.png")
    logo.resize(dimensions)
    logo.sync()

    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true})
    const context = new window.AudioContext()
    const node = context.createMediaStreamSource(stream)

    // sound = await Sound.load("/assets/song.mp3")
    sound = Sound.from(node, context, "input", stream)
    sound.analyze(maxBin)
    sound.start()
  },
  animate() {
    if(sound) {
      let td = sound.timeDomainTo( [200, 100], [50, 50] )
      form.fill('#000').stroke(false).points( td , 3, 'circle')

      const timeDomains = chunk(sound.freqDomain(), maxBin / 4).map(band => {
        return max([0.5,mean(band) / 256])
      })

      const rect = Rectangle.fromCenter(space.center, timeDomains[0] * size)
      form.image(rect, logo)
    }
  }
})

space.bindMouse().bindTouch().play()
