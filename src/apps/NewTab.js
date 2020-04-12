import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
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
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core/styles'
import clsx from 'clsx'
import CircularProgress from '@material-ui/core/CircularProgress'
import DeleteIcon from '@material-ui/icons/Close'

import CssBaseline from '@material-ui/core/CssBaseline'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'

import blue from '@material-ui/core/colors/blue'
import pink from '@material-ui/core/colors/pink'

import configs from '../configs/firebase'
import ItemCard from '../components/Card'
import { useFeatureFlags } from '../helpers/featureFlag'

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
  margin-top: 32px;
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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    minWidth: 360,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}))

const useUserDataFromFirebase = () => {
  const [authenticating, setAuthenticating] = useState(true)
  const [loadingFlashcards, setLoadingFlashcards] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [userWords, setUserWords] = useState([])

  useEffect(() => {
    setAuthenticating(true)
    firebase.initializeApp(configs)

    firebase.auth().onAuthStateChanged(function (user) {
      setAuthenticating(false)
      if (!user) {
        setCurrentUser(null)
        return
      }

      const { uid, displayName } = user
      setCurrentUser({
        uid,
        displayName,
      })

      setLoadingFlashcards(true)
      firebase
        .database()
        .ref('user_flashcards/' + user.uid)
        .on('value', (snapshot) => {
          const words = snapshot.val()
          Promise.all(
            Object.keys(words).map((w) =>
              firebase
                .database()
                .ref('words/' + w)
                .once('value')
            )
          )
            .then((snapshots) =>
              snapshots.reduce((all, s) => ({ ...all, [s.key]: s.val() }), {})
            )
            .then((r) => {
              console.warn('Synced', r)
              const words = shuffleArray(Object.values(r))
              setUserWords(words)
              setLoadingFlashcards(false)
            })
        })
    })
  }, [])

  return { authenticating, loadingFlashcards, currentUser, userWords }
}

const TOPIC_ALL = 'All'

const useWordsByTopic = (userWords) => {
  const [activeTopic, setActiveTopic] = useState(TOPIC_ALL)
  const [activeIndex, setActiveIndex] = useState(0)
  const wordsByTopic = useMemo(
    () =>
      userWords.reduce(
        (prev, w) => {
          ;(w.topics || []).forEach((t) => {
            prev[t] = [...(prev[t] || []), w]
            prev[TOPIC_ALL] = [...prev[TOPIC_ALL], w]
          })

          return prev
        },
        { [TOPIC_ALL]: [] }
      ),
    [userWords]
  )

  console.warn('wordsByTopic', userWords, wordsByTopic)

  return {
    wordsByTopic,
    activeTopic,
    activeIndex,
    setActiveIndex,
    setActiveTopic,
  }
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blue,
    secondary: pink,
  },
})

const Chips = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;

  > div {
    margin: 4px;
  }
`

const NewTab = () => {
  const classes = useStyles()
  const [expanded, setExpanded] = useState(false)

  const {
    authenticating,
    loadingFlashcards,
    userWords,
    currentUser,
  } = useUserDataFromFirebase()

  const { features } = useFeatureFlags()

  const {
    wordsByTopic,
    activeTopic,
    setActiveTopic,
    activeIndex,
    setActiveIndex,
  } = useWordsByTopic(userWords)
  const maxIndex = wordsByTopic[activeTopic].length

  const onClickNext = () =>
    activeIndex < maxIndex - 1 && setActiveIndex(activeIndex + 1)

  const onClickBack = () => activeIndex > 0 && setActiveIndex(activeIndex - 1)

  const renderSearchResult = (expanded) => {
    if (!userWords[activeIndex]) {
      return null
    }

    return <ItemCard expanded={expanded} {...userWords[activeIndex]} />
  }

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const handleDeleteClick = () => {
    if (!userWords[activeIndex]) {
      return null
    }

    const { name } = userWords[activeIndex]
    firebase
      .database()
      .ref(`user_flashcards/${currentUser.uid}/${name}`)
      .remove()
  }

  const render = (children) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>{children}</Container>
    </ThemeProvider>
  )

  if (authenticating) {
    return render(
      <>
        <CircularProgress />
        <Hey>Validating session</Hey>
      </>
    )
  }

  if (loadingFlashcards) {
    return render(
      <>
        <CircularProgress />
        <Hey>Loading your flashcards</Hey>
      </>
    )
  }

  if (!currentUser) {
    return render(
      <Hey>
        You must login first!
        <br /> By clicking on the extension icon.
      </Hey>
    )
  }

  if (Object.keys(userWords).length === 0) {
    return render(<Hey>You have no flashcard yet! Keep adding!</Hey>)
  }

  return render(
    <>
      <Hey>
        Hi <b>{currentUser.displayName}</b>,<br /> there are your flashcards!
        Try your best 💪
      </Hey>

      <Chips>
        {features.displayTopics &&
          Object.entries(wordsByTopic).map(([t, values]) => (
            <Chip
              avatar={<Avatar>{values.length}</Avatar>}
              label={`${t}`}
              key={t}
              variant="outlined"
              onClick={() => setActiveTopic(t) && setActiveIndex(0)}
              color={t === activeTopic ? 'primary' : ''}
            />
          ))}
      </Chips>

      <Card className={classes.card}>
        <CardHeader
          action={
            <>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="Show Phonetics"
              >
                <ExpandMoreIcon />
              </IconButton>
              <IconButton onClick={handleDeleteClick} aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </>
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
  )
}

export default NewTab
