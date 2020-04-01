import { useCallback, useEffect } from 'react'
import * as firebase from 'firebase'

import configs from '../configs/firebase'

const logIn = (interactive, errorCallback) => {
  window.chrome.identity.getAuthToken({ interactive: !!interactive }, token => {
    if (window.chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
    } else if (window.chrome.runtime.lastError) {
      errorCallback(window.chrome.runtime.lastError)
    } else if (token) {
      const credential = firebase.auth.GoogleAuthProvider.credential(
        null,
        token
      )
      firebase
        .auth()
        .signInWithCredential(credential)
        .catch(error => {
          if (error.code === 'auth/invalid-credential') {
            window.chrome.identity.removeCachedAuthToken({ token: token }, () =>
              logIn(interactive)
            )
          }
        })
    } else {
      console.error('The OAuth Token was null')
    }
  })
}

const useLogIn = () => {
  const toggleLogIn = useCallback(() => {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut()
    } else {
      logIn(true, err => console.error(err))
    }
  }, [])

  return {
    toggleLogIn
  }
}

const useAuthStateChanged = cb => {
  useEffect(() => {
    firebase.initializeApp(configs)

    firebase.auth().onAuthStateChanged(cb)
  }, [])
}

export { useLogIn, useAuthStateChanged }
