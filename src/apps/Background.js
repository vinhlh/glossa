import { useEffect } from 'react'
import * as firebase from 'firebase'

import configs from '../configs/firebase'
import { STORE_WORD, LOOK_UP } from '../constants/messageType'

const initFirebase = () => {
  firebase.initializeApp(configs)
  firebase.auth().onAuthStateChanged(function(user) {
    console.log(
      'User state change detected from the Background script of the window.Chrome Extension:',
      user
    )
  })
}

const cleanUpHTMLContent = content => {
  content.querySelector('.top-g').remove()
  content.querySelector('.dictlink-g').remove()
  content.querySelector('.pron-link').remove()
  Array.from(content.querySelectorAll('.xref_to_full_entry')).forEach(n =>
    n.remove()
  )
  Array.from(content.querySelectorAll('.symbols')).forEach(n => n.remove())
  Array.from(content.querySelectorAll('.ox-enlarge-label')).forEach(n =>
    n.remove()
  )
  Array.from(content.querySelectorAll('.Ref')).forEach(n =>
    n.setAttribute('target', '__blank')
  )
}

const unique = arr => [...new Set(arr)]

const parseHTML = html => {
  const el = document.createElement('html')
  el.innerHTML = html
  const entries = el.getElementsByClassName('entry')

  if (!entries.length) {
    return null
  }

  const [entry] = entries

  const phonBr = entry.querySelector('.phons_br .phon').innerText
  const phonAm = entry.querySelector('.phons_n_am .phon').innerText

  const pos = entry.querySelector('.webtop .pos').innerText
  const def = entry.querySelector('.def').innerText
  const topics = unique(
    [...entry.querySelectorAll('.senses_multiple .topic .topic_name')].map(
      el => el.innerText
    )
  )

  const soundBr = entry
    .querySelector('.phons_br .sound')
    .getAttribute('data-src-mp3')
  const soundAm = entry
    .querySelector('.phons_n_am .sound')
    .getAttribute('data-src-mp3')

  cleanUpHTMLContent(entry)

  return {
    html: entry.outerHTML,
    phonBr,
    phonAm,
    soundBr,
    soundAm,
    pos,
    def,
    topics
  }
}

const OLAD_LOOK_UP_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/'

const searchOnOxford = (searchTerm, senderTabId) => {
  window.window.chrome.runtime.sendMessage('', { search: searchTerm })
  fetch(OLAD_LOOK_UP_URL + searchTerm)
    .then(r => r.text())
    .then(parseHTML)
    .then(data => {
      if (data) {
        window.chrome.tabs.sendMessage(senderTabId, data)
      } else {
        window.chrome.tabs.sendMessage(senderTabId, { error: 'Not Found' })
      }
    })
    .catch(() => {
      window.chrome.tabs.sendMessage(senderTabId, { error: 'Not Found' })
    })
}

const initListeners = () => {
  console.warn('running')

  window.chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      switch (request.type) {
        case LOOK_UP:
          const { searchTerm } = request
          console.warn(`search with ${searchTerm}`)

          searchOnOxford(searchTerm, sender.tab.id)
          break
        case STORE_WORD:
          const { word, data } = request
          console.warn('stored', word, data)

          storeInFirebaseDatabase(word, data)
          break
        default:
      }
    }
  )
}

const storeInFirebaseDatabase = (name, value) => {
  var user = firebase.auth().currentUser
  if (!user) {
    console.warn('Not login yet')
    return
  }

  const { html, ...others } = value
  firebase
    .database()
    .ref('words/' + name)
    .set({
      ...others,
      name
    })

  const { topics } = value
  topics.forEach(t => {
      firebase
        .database()
        .ref(`topics/${t}/${name}`)
        .set(true)
  })

  firebase
    .database()
    .ref(`user_flashcards/${user.uid}/${name}`)
    .set(true)
}

const Background = () => {
  useEffect(() => {
    initListeners()
    initFirebase()
  }, [])

  return null
}

export default Background
