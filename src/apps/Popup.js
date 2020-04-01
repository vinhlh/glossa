import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import { useLogIn, useAuthStateChanged } from '../helpers/auth'

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
  const [btnColor, setBtnColor] = useState('primary')
  const [currentUser, setCurrentUser] = useState(null)
  const [disabled, setDisabled] = useState(true)

  const { toggleLogIn } = useLogIn()

  useAuthStateChanged(user => {
    console.warn('useAuthStateChanged')
    if (user) {
      const { displayName, email } = user
      setBtnText('Sign out')
      setBtnColor('secondary')
      setCurrentUser({ displayName, email })
      console.warn('user', user)
    } else {
      setBtnText('Sign-in with Google')
      setBtnColor('primary')
      setCurrentUser(null)
    }
    setDisabled(false)
  })

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
        color={btnColor}
        onClick={toggleLogIn}
        disabled={disabled}
      >
        {btnText}
      </Button>
    </Container>
  )
}

export default Popup
