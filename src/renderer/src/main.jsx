// import './wdyr'
import './polyfill.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
//  createBrowserRouter,
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import ErrorMsg from './components/errorMsg'
import Applayout from './components/Applayout.jsx'
import TreeMan from './routes/treeman'

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import './app.css'

const themeOptions = {
};

const theme = createTheme(themeOptions)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <StyledEngineProvider>
      {/* <RouterProvider router={router} /> */}
      <HashRouter basename="/">
        <Routes>
          <Route path="/" element={<Applayout/>} errorElement={<ErrorMsg />}>
            <Route index={true} element={<TreeMan />} />
          </Route>
        </Routes>
      </HashRouter>
    </StyledEngineProvider>
  </ThemeProvider>
)