'use strict'
$(async function () {
  const ChangeScreen = function ($who) {
    $('main > *').removeAttr('style')
    $who.show()
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
    const $Deck = $('[name="deck"]')
    for (const Deck of Object.keys(Decks)) {
      const deck = Decks[Deck]
      $Deck.append($('<option>', {
        value: Deck,
        text: deck.name
      }))
    }
    // $Deck.formSelect()

    const $TimeoutVal = $('#TimeoutVal')
    $('[name="timeout"]').on('input', me =>
      $TimeoutVal.text(INTLnum.format(me.target.value))
    ).trigger('input')

    const $Voice = $('[name="voice"]')
    for (const vc of Voices) {
      const lang = vc.lang.split('-')[0]
      $Voice.append($('<option>', {
        value: vc.name,
        text: `[${lang}] ${vc.name}`
      }))
    }

    $NewRound.find('select').formSelect()

    $NewRound.submit(evt => {
      evt.preventDefault()
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
      $History.append($('<div>', {
        text: CardName
      }))

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
