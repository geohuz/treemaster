import React, {useRef, useState} from 'react'
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MuiDrawer from '@mui/material/Drawer';
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useFullscreen } from '@straw-hat/react-fullscreen';
import { SlotsProvider, Slot } from 'nano-slots'
import { Outlet } from 'react-router-dom'

import 'react-pdf/dist/esm/Page/TextLayer.css';
import './toc.css'
import { pdfjs, Document, Page, Outline } from 'react-pdf'
import {toJS} from 'mobx'

import navStructure from './navStructure'
import RenderTree from './RenderTree'
import {observer, useLocalObservable} from 'mobx-react-lite'
import appStore from '../stores/store'

import SvgIcon from '@mui/material/SvgIcon';
import Simpletree from '../simpletree.svg'

import uguide from './uguide.pdf'

const drawerWidth = 60 
const drawerWidthRight = 200 


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};


const FullscreenButton = () => {
  const target = React.useRef(window.document.body);
  const { isFullscreen, toggleFullscreen } = useFullscreen(target);
 
  return (
    <IconButton edge="end" color="inherit" onClick={toggleFullscreen}>
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
  );
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })
(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: -drawerWidthRight,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: -Math.abs(drawerWidth-drawerWidthRight),
  }),
  marginRight: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidthRight,
  }),
}));

const DrawerHeader = styled('div')(({ theme, side }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: side==="left"? 'flex-end' : 'flex-start',
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})
(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px - ${drawerWidthRight}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
    marginRight: drawerWidthRight,
  }),
}));

export var portalRef
export var portalRightRef

const Applayout = observer(function Applayout() {
  const localStore = useLocalObservable(()=> ({
    pdfShow: false,
    setPdfShow(bool) {
      this.pdfShow = bool
    }
  }))
  portalRef = React.useRef(null)
  portalRightRef = React.useRef(null)
  const theme = useTheme();

  const handleDrawerOpen = () => {
    appStore.setSidebarOpen(true)
  };

  const handleDrawerClose = () => {
    appStore.setSidebarOpen(false)
  };

  const open = appStore.sidebarOpen

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar color="transparent" position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Tree Org
          </Typography>
          <SvgIcon color="primary" sx={{ml: 1}}>
            <Simpletree />
          </SvgIcon>
          <Toolbar sx={{flexGrow: 1}}>
            <Slot name="treeControls" />
            <FullscreenButton />
          </Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            sx={{ flexGlow: 1, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton onClick={()=>localStore.setPdfShow(true)}>
            <HelpOutlineOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer 
        sx={{width: 0, flexShrink: 0, 
          '& .MuiDrawer-paper': {
            overflowX: 'hidden',
            width: drawerWidth,
            boxSizing: 'border-box',
          }}}
        variant="persistent" 
        anchor="left" 
        open={open}>
        <DrawerHeader side="left">
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <div ref={portalRef} />
      </Drawer>
      <Drawer
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            width: drawerWidthRight,
            boxSizing: 'border-box',
          },     
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader side="right">
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <div ref={portalRightRef} />
      </Drawer>
      <AppHelp width={800} show={localStore.pdfShow} close={()=>localStore.setPdfShow(false)} />
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  )
})

const AppHelp = observer(({width, show, close}) => {
  const localStore = useLocalObservable(()=> ({
    numPages: null,
    pageNumber: 1,
    setNumPages(pages) {
      this.numPages = pages
    },
    setPageNumber(page) {
      this.pageNumber = page
    }
  }))

  function onPDFLoadSuccess({ numPages }) {
    localStore.setNumPages(numPages);
  }

  return (
    <Drawer
      anchor={"right"}
      open={show}
      onClose={close}
    >
    <Box sx={{width: width}}
      role="presentation"
    >
      <Document file={uguide} onLoadSuccess={onPDFLoadSuccess} >
        <Outline />
        {Array.from(new Array(toJS(localStore.numPages)), (el, index) => (
        <Page 
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          height={800}
          scale={1.5}
          key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </Box>
    </Drawer>
  )
})

export default ()=> 
  <SlotsProvider>
    <Applayout />
  </SlotsProvider>
