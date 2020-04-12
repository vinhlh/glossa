import React from 'react'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'

import { useFeatureFlags } from '../helpers/featureFlag'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
  },
}))

const Options = () => {
  const classes = useStyles()

  const { features, setFeatures } = useFeatureFlags()

  const handleChange = (event) => {
    const nextState = { ...features, [event.target.name]: event.target.checked }
    setFeatures(nextState)
    window.chrome.storage.sync.set({
      features: nextState,
    })
  }

  const { displayTopics } = features

  return (
    <div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Options</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!displayTopics}
                onChange={handleChange}
                name="displayTopics"
              />
            }
            label="Display topics on new tab"
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default Options
