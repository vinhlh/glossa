import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import root from 'react-shadow'

const propTypes = {
  html: PropTypes.string
}

const Container = styled.div`
  font-family: sans-serif;
  font-size: 16px;
  line-height: 25.6px;
`

const ACTIVE_CLASS = 'is-active'

// XXX: Somehow the Shadow DOM is not ready when immediately selecting elements in useEffect.
// Hence, this is a trick to solve this issue.
const EVENT_LISTENING_DELAY = 300

const OALD_CSS_URL =
  'https://www.oxfordlearnersdictionaries.com/external/styles/oald10.css?version=2.0.29'

function toggleCollapse() {
  const parentNode = this.parentNode
  if (parentNode.classList.contains(ACTIVE_CLASS)) {
    parentNode.classList.remove(ACTIVE_CLASS)
  } else {
    parentNode.classList.add(ACTIVE_CLASS)
  }
}

const StyledOxfordHTMLContent = ({ html }) => {
  const shadowNode = useRef(null)

  useEffect(() => {
    let elements = []

    const timeout = setTimeout(() => {
      elements = [
        ...shadowNode.current.shadowRoot.querySelectorAll(
          '.unbox .box_title, .unbox .heading'
        )
      ]

      elements.forEach(el => el.addEventListener('click', toggleCollapse))
    }, EVENT_LISTENING_DELAY)

    return () => {
      clearTimeout(timeout)
      elements.forEach(el => el.removeEventListener('click', toggleCollapse))
    }
  }, [html])

  return (
    <root.div ref={shadowNode} mode="open">
      <link rel="stylesheet" type="text/css" href={OALD_CSS_URL} />
      <Container dangerouslySetInnerHTML={{ __html: html }}></Container>
    </root.div>
  )
}

StyledOxfordHTMLContent.propTypes = propTypes

export default StyledOxfordHTMLContent
