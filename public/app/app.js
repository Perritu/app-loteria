'use strict'
$(async function () {
  const ChangeScreen = function ($who) {
    $('main > *').removeAttr('style')
    $who.show()
  }

  const $Config = function (key, val) {
    let config = localStorage.getItem('config')
    if (!config) {
      config = {}
    } else {
      config = JSON.parse(config)
    }

    let steps = key.split('.'), last = steps.pop(), current = config
    for (const step of steps) {
      if (!current[step]) {
        current[step] = {}
      }
      current = current[step]
    }

    if (val !== undefined) {
      current[last] = val
      localStorage.setItem('config', JSON.stringify(config))
    }

    return current[last]
  }

  const Decks = await fetch('decks/decks.json').then(r => r.json())
  const INTLnum = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1 })
  const Sleep = ms => new Promise(solve => setTimeout(solve, ms, true))
  const Voices = await (() => new Promise(solve => {
    const Interval = setInterval(() => {
      const Voices = speechSynthesis.getVoices()
      if (Voices.length) {
        clearInterval(Interval)
        solve([...Voices])
      }
    }, 100)
  }))()

  const $NewRound = $('#NewRound')
  $(() => {
    const $Deck = $('[name="deck"]'), LastDeckUsed = $Config('Startup.settings.deck')
    for (const Deck of Object.keys(Decks)) {
      const deck = Decks[Deck]
      $Deck.append($('<option>', {
        value: Deck,
        text: deck.name
      }))
    }
    if (LastDeckUsed) {
      $Deck.val(LastDeckUsed)
    }

    const $Timeout = $('[name="timeout"]'),
      $TimeoutVal = $('#TimeoutVal'),
      LastTimeout = $Config('Startup.settings.timeout')
    if (LastTimeout) $Timeout.val(LastTimeout)

    $Timeout.on('input', function () {
      $TimeoutVal.text(INTLnum.format(this.value))
    }).trigger('input')

    const $Voice = $('[name="voice"]'),
      LastVoice = $Config('Startup.settings.voice')
    for (const vc of Voices) {
      const lang = vc.lang.substr(0, 2).toUpperCase()
      $Voice.append($('<option>', {
        value: vc.name,
        text: `[${lang}] ${vc.name}`
      }))
    }
    if (LastVoice) {
      $Voice.val(LastVoice)
    }

    $NewRound.find('select').formSelect()

    $NewRound.submit(evt => {
      evt.preventDefault()

      // Save config to localStorage, so we can load it when restarting.
      $Config('Startup.settings', {
        deck: $Deck.val(),
        timeout: $Timeout.val(),
        voice: $Voice.val()
      })

      ChangeScreen($RunningRound)
      newPlay(
        Decks[$Deck.val()],
        $TimeoutVal.text() * 1000,
        $Voice.val()
      )
    })
  })

  const $RunningRound = $('#RunningRound')
  const newPlay = async (deck, timeout, voice) => {
    const $CardImage = $('#cardImage')
    const $History = $('#history')

    $('#deckName').text(deck.name)
    const BasePath = `decks/${deck.path}/`
    const randomDeck = Object.keys(deck.cards).sort(() => Math.random() - 0.5)
    const ttsEngine = new SpeechSynthesisUtterance()
    ttsEngine.voice = Voices.find(v => v.name === voice)

    for (const CardName of randomDeck) {
      const path = deck.cards[CardName]
      $CardImage.attr('src', `${BasePath}${path}`)

      $History.append($('<img>', {
        src: `${BasePath}${path}`,
        alt: CardName,
        class: 'historyCard'
      }))

      // Scroll to the right; JQ slim, so no animate()
      $History.scrollLeft($History.scrollLeft() + 1000)

      await Promise.all([
        Sleep(timeout),
        new Promise(solve => {
          ttsEngine.text = CardName
          ttsEngine.onend = solve
          speechSynthesis.speak(ttsEngine)
        })
      ])
    }
  }

  ChangeScreen($NewRound)
})
