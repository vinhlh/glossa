import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography'
import Collapse from '@material-ui/core/Collapse'

import Audio from './Audio'

const propTypes = {
  name: PropTypes.string,
  pos: PropTypes.string,
  def: PropTypes.string,
  phonBr: PropTypes.string,
  phonAm: PropTypes.string,
  soundBr: PropTypes.string,
  soundAm: PropTypes.string,
  children: PropTypes.node,
  expanded: PropTypes.bool
}

const Phon = styled.div`
  display: inline-block;
  margin-left: 4px;
`

const PhonGroup = styled.div`
  margin: 8px 0;
  font-size: 14px;
`

const Card = ({
  name,
  pos,
  def,
  phonBr,
  phonAm,
  soundBr,
  soundAm,
  children,
  expanded
}) => {
  return (
    <div>
      <Typography variant="h4">{name}</Typography>
      <Typography variant="subtitle1" style={{ fontStyle: 'italic' }}>
        {pos}
      </Typography>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Typography variant="body1">{def}</Typography>
        <PhonGroup>
          <Audio accent="br" uri={soundBr} />
          <Phon>{phonBr}</Phon>
        </PhonGroup>
        <PhonGroup>
          <Audio accent="am" uri={soundAm} />
          <Phon>{phonAm}</Phon>
        </PhonGroup>
      </Collapse>
      {children}
    </div>
  )
}

Card.propTypes = propTypes

export default Card
