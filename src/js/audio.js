import { Howl } from 'howler'
import audioCompleteLevel from '../audio/audioCompleteLevel.mp3'
import audioDie from '../audio/audioDie.mp3'
import audioMaskShot from '../audio/audioMaskShot.mp3'
import audioGameOver from '../audio/audioGameOver.mp3'
import audioJump from '../audio/audioJump.mp3'
import audioMusicLevel1 from '../audio/audioMusicLevel1.mp3'
import audioObtainMask from '../audio/audioObtainMask.mp3'
import audioWinLevel from '../audio/audioWinLevel.mp3'
import audioVirusSquash from '../audio/audioVirusSquash.mp3'

export const audio = {
  completeLevel: new Howl({
    src: [audioCompleteLevel],
    volume: 0.1
  }),
  die: new Howl({
    src: [audioDie],
    volume: 0.1
  }),
  maskShot: new Howl({
    src: [audioMaskShot],
    volume: 0.1
  }),
  gameOver: new Howl({
    src: [audioGameOver],
    volume: 0.1
  }),
  jump: new Howl({
    src: [audioJump],
    volume: 0.1
  }),
  musicLevel1: new Howl({
    src: [audioMusicLevel1],
    volume: 0.1,
    loop: false,
    autoplay: false,
  }),
  obtainMask: new Howl({
    src: [audioObtainMask],
    volume: 0.1
  }),
  virusSquash: new Howl({
    src: [audioVirusSquash],
    volume: 0.1
  }),
  winLevel: new Howl({
    src: [audioWinLevel],
    volume: 0.1
  })
}
