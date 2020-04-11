import React from 'react'
import ReactDOM from 'react-dom'
import InlineApp from './apps/Inline'
import NewTab from './apps/NewTab'
import Background from './apps/Background'
import Popup from './apps/Popup'
import Options from './apps/Options'

const APP_SELECTOR_ID = 'glossa.ext'

const AppsRegistered = {
  NewTab,
  Background,
  Popup,
  Options
}

const render = () => {
  const appName = window.location.search.replace('?app=', '')
  if (AppsRegistered[appName]) {
    const Component = AppsRegistered[appName]
    ReactDOM.render(<Component />, document.getElementById('root'))
    return
  }

  const anchor = document.createElement('div')
  anchor.id = APP_SELECTOR_ID
  document.body.insertBefore(anchor, document.body.childNodes[0])

  ReactDOM.render(<InlineApp />, document.getElementById(APP_SELECTOR_ID))
}

render()
