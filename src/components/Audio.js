import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const propTypes = {
  accent: PropTypes.oneOf(['am', 'br']),
  uri: PropTypes.string
}

const ImageIcon = styled.div`
  width: 28px;
  height: 28px;
  background-repeat: no-repeat;
  background-position: left top !important;
  background-size: 100%;
  vertical-align: middle;
  background-image: url(${props => props.src});
  display: inline-block;

  :hover {
    background-image: url(${props => props.hover});
    cursor: pointer;
  }
`

const HiddenAudio = styled.audio`
  display: none;
`

const SVG_LOCATION =
  'https://www.oxfordlearnersdictionaries.com/external/images/documents'

const getImagesByAccent = accent =>
  ({
    br: {
      src: `${SVG_LOCATION}/audio_bre_initial.svg`,
      hover: `${SVG_LOCATION}/audio_bre_playing.svg`
    },
    am: {
      src: `${SVG_LOCATION}/audio_name_initial.svg`,
      hover: `${SVG_LOCATION}/audio_name_playing.svg`
    }
  }[accent])

const onSoundClick = el => () => {
  el.current.load()
  el.current.play()
}

const Audio = ({ accent, uri }) => {
  const audio = useRef(null)

  return (
    <>
      <ImageIcon
        onClick={onSoundClick(audio)}
        {...getImagesByAccent(accent)}
      ></ImageIcon>
      <HiddenAudio ref={audio}>
        <source type="audio/mpeg" src={uri} />
      </HiddenAudio>
    </>
  )
}

Audio.propTypes = propTypes

export default Audio
