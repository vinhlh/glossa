import React, { useEffect, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import * as firebase from 'firebase'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MobileStepper from '@material-ui/core/MobileStepper'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import CircularProgress from '@material-ui/core/CircularProgress'

import configs from '../configs/firebase'
import ItemCard from '../components/Card'

const GlobalStyle = createGlobalStyle`
   body {
      background-color: #333;
   }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 200px auto;
  width: 360px;
  position: relative;
  flex-direction: column;
`

const Hey = styled.div`
  color: #fff;
  font-size: 16px;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
`

// implementation of the Durstenfeld shuffle
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 360,
    maxWidth: 420
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}))

const useUserDataFromFirebase = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userWords, setUserWords] = useState([])

  useEffect(() => {
    firebase.initializeApp(configs)

    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        console.warn('Must login')
        return
      }

      const { displayName } = user
      setCurrentUser({
        displayName
      })

      firebase
        .database()
        .ref('user_flashcards/' + user.uid)
        .on('value', snapshot => {
          const words = snapshot.val()
          Promise.all(
            Object.keys(words).map(w =>
              firebase
                .database()
                .ref('words/' + w)
                .once('value')
            )
          )
            .then(snapshots =>
              snapshots.reduce((all, s) => ({ ...all, [s.key]: s.val() }), {})
            )
            .then(r => {
              console.warn('Synced', r)
              const words = shuffleArray(Object.values(r))
              setUserWords(words)
            })
        })
    })
  }, [])

  return {
    currentUser,
    userWords
  }
}

const NewTab = () => {
  const classes = useStyles()
  const [activeIndex, setActiveIndex] = useState(0)
  const [expanded, setExpanded] = React.useState(false)

  const { userWords, currentUser } = useUserDataFromFirebase()
  const maxIndex = userWords.length

  const onClickNext = () =>
    activeIndex < userWords.length - 1 && setActiveIndex(activeIndex + 1)

  const onClickBack = () => activeIndex > 0 && setActiveIndex(activeIndex - 1)

  const renderSearchResult = expanded => {
    if (!userWords[activeIndex]) {
      return null
    }

    return <ItemCard expanded={expanded} {...userWords[activeIndex]} />
  }

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        {Object.keys(userWords).length === 0 ? (
          <CircularProgress />
        ) : (
          <>
            {currentUser && (
              <Hey>
                Hi <b>{currentUser.displayName}</b>,<br /> there are your
                flashcards! Try your best 💪
              </Hey>
            )}
            <Card className={classes.root}>
              <CardHeader
                action={
                  <IconButton
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: expanded
                    })}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="Show Phonetics"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                }
              />
              <CardContent style={{ marginTop: -72 }}>
                {renderSearchResult(expanded)}
              </CardContent>
              <MobileStepper
                steps={maxIndex}
                position="static"
                variant="text"
                activeStep={activeIndex}
                nextButton={
                  <Button
                    size="small"
                    onClick={onClickNext}
                    disabled={activeIndex === maxIndex - 1}
                  >
                    Next
                    <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={onClickBack}
                    disabled={activeIndex === 0}
                  >
                    <KeyboardArrowLeft />
                    Back
                  </Button>
                }
              />
            </Card>
          </>
        )}
      </Container>
    </>
  )
}

export default NewTab