import React, { Component } from 'react'
import styled from 'styled-components/macro'

import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'

import StyledOxfordHTMLContent from '../components/StyledOxfordHTMLContent'
import Audio from '../components/Audio'
import { STORE_WORD, LOOK_UP } from '../constants/messageType'

const PopupContainer = styled.div`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  margin-top: ${props => props.offset}px;
  background: #1a3561;
  color: #fff;
  z-index: 99999;
  font-size: 11px;
  padding: 2px 8px;
  user-select: none;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
  border-radius: 3px;

  &:hover {
    cursor: pointer;
    background: #0f2d5f;
  }

  span {
    font-size: 11px;
  }
`

const PopupContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const SidebarContent = styled.div`
  padding: 16px;
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  padding-bottom: 32px;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 25.6px;
`

const SearchTerm = styled.div`
  font-size: 34px;
  font-weight: 600;
  color: #1a3561;
  flex: 1;
  font-family: sans-serif;
`

const Phon = styled.div`
  display: inline-block;
  margin-left: 4px;
`

const PhonGroup = styled.div`
  margin: 8px 0;
`

const Copyright = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  user-select: none;
  height: 100%;

  img {
    width: 200px;
    margin-left: 4px;
  }

  span {
    padding-top: 2px;
  }
`

const drawerWidth = 360

const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth,
    zIndex: 99998
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  drawerFooter: {
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
    minHeight: 32
  }
})

class App extends Component {
  state = {
    searching: false,
    displaySidebar: false,
    selection: null,
    searchTerm: '',
    searchResult: null,
    saved: false
  }

  constructor() {
    super()
    this.listen()
  }

  listen() {
    this.listenEvents()
    this.listenMessages()
  }

  listenEvents = () => {
    document.addEventListener('click', this.onTextSelections)
    window.addEventListener('scroll', () => {
      this.setState({
        selection: null
      })
    })
  }

  listenMessages = () => {
    window.chrome.runtime.onMessage &&
      window.chrome.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
          console.warn('Received', request)
          if (request.error) {
            this.setState({ error: request.error, searching: false })
            return
          }
          this.setState({ searchResult: request, searching: false })
        }
      )
  }

  onTextSelections = () => {
    const selection = window.getSelection()

    if (!selection || selection.type !== 'Range' || selection.isCollapsed) {
      this.setState({ selection: null })
      return
    }

    this.setState({
      selection
    })
  }

  search = searchTerm => {
    this.setState({
      displaySidebar: true,
      searching: true,
      searchTerm,
      searchResult: null,
      error: null,
      saved: false
    })

    this.searchOnOxford(searchTerm)
  }

  searchOnOxford = searchTerm => {
    window.chrome.runtime.sendMessage('', { type: LOOK_UP, searchTerm })
  }

  renderPopUp() {
    const { selection } = this.state
    if (!this.state.selection) {
      return
    }

    const { x, y, height } = selection.getRangeAt(0).getBoundingClientRect()
    const searchTerm = selection
      .toString()
      .toLowerCase()
      .trim()

    if (searchTerm === '') {
      return
    }

    return (
      <PopupContainer
        top={y}
        left={x}
        offset={height}
        onClick={() => this.search(searchTerm)}
      >
        <PopupContent>
          {' '}
          <SearchIcon fontSize="small" style={{ marginRight: 8 }} />{' '}
          <span>Look up</span>
        </PopupContent>
      </PopupContainer>
    )
  }

  onCloseBtnClick = () => {
    this.setState({
      displaySidebar: false
    })
  }

  saveSearchTerm = () => {
    const { searchTerm, searchResult } = this.state
    window.chrome.runtime.sendMessage('', {
      type: STORE_WORD,
      word: searchTerm,
      data: searchResult
    })
    this.setState({
      saved: true
    })
  }

  renderSearchResult = () => {
    const { searching, searchResult, error } = this.state
    if (searching) {
      return <div>Loading</div>
    }

    if (error) {
      return <div>{error}</div>
    }

    if (!searchResult) {
      return null
    }

    const { phonBr, phonAm, soundBr, soundAm, html } = searchResult
    return (
      <div>
        <PhonGroup>
          <Audio accent="br" uri={soundBr} />
          <Phon>{phonBr}</Phon>
        </PhonGroup>
        <PhonGroup>
          <Audio accent="am" uri={soundAm} />
          <Phon>{phonAm}</Phon>
        </PhonGroup>
        <StyledOxfordHTMLContent html={html} />
      </div>
    )
  }

  renderSidebar = () => {
    const { displaySidebar, searchTerm, saved } = this.state

    return (
      <Drawer
        className={this.props.classes.drawer}
        variant="persistent"
        anchor="right"
        open={displaySidebar}
        classes={{
          paper: this.props.classes.drawerPaper
        }}
      >
        <div className={this.props.classes.drawerHeader}>
          <SearchTerm>
            {searchTerm}{' '}
            <IconButton aria-label="delete" onClick={this.saveSearchTerm}>
              {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </SearchTerm>
          <IconButton onClick={this.onCloseBtnClick}>
            <ChevronRightIcon />
          </IconButton>
        </div>
        <Divider />

        <SidebarContent>{this.renderSearchResult()}</SidebarContent>

        <Divider />
        <div className={this.props.classes.drawerFooter}>
          <Copyright>
            <span>Powered by </span>
            <img
              alt="Oxford Learner's Dictionaries"
              src="https://www.oxfordlearnersdictionaries.com/external/images/OLD_logo.svg"
            />
          </Copyright>
        </div>
        <Divider />
      </Drawer>
    )
  }

  render() {
    return (
      <>
        {this.renderPopUp()}
        {this.renderSidebar()}
      </>
    )
  }
}

export default withStyles(styles)(App)
