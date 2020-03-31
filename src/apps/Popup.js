import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as firebase from 'firebase'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import configs from '../configs/firebase'

function startAuth(interactive) {
  window.chrome.identity.getAuthToken({ interactive: !!interactive }, function(
    token
  ) {
    if (window.chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
    } else if (window.chrome.runtime.lastError) {
      console.error(window.chrome.runtime.lastError)
    } else if (token) {
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
      firebase
        .auth()
        .signInWithCredential(credential)
        .catch(function(error) {
          if (error.code === 'auth/invalid-credential') {
            window.chrome.identity.removeCachedAuthToken(
              { token: token },
              function() {
                startAuth(interactive)
              }
            )
          }
        })
    } else {
      console.error('The OAuth Token was null')
    }
  })
}

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 24px;
`
const Container = styled.div`
  width: 300px;
  padding: 16px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`

const Status = styled.div`
  margin-bottom: 16px;
`

const Popup = () => {
  const [btnText, setBtnText] = useState('Login in with Google')
  const [currentUser, setCurrentUser] = useState(null)
  const [disabled, setDisabled] = useState(true)

  const startSignIn = () => {
    setDisabled(true)

    if (firebase.auth().currentUser) {
      firebase.auth().signOut()
    } else {
      startAuth(true)
    }
  }

  useEffect(() => {
    firebase.initializeApp(configs)

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const { displayName, email } = user
        setBtnText('Sign out')
        setCurrentUser({ displayName, email })
      } else {
        setBtnText('Sign-in with Google')
      }

      setDisabled(false)
    })
  }, [])

  return (
    <Container>
      <Header>Glossa</Header>
      {currentUser && (
        <Status>
          <Typography variant="body1">Logged in as</Typography>
          <Typography variant="h6">{currentUser.email}</Typography>
        </Status>
      )}

      <Button
        variant="contained"
        color="secondary"
        onClick={startSignIn}
        disabled={disabled}
      >
        {btnText}
      </Button>
    </Container>
  )
}

export default Popup
