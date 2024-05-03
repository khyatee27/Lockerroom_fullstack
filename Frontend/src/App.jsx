import { useState } from 'react'
import LogIn from './components/LogIn'
import React from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './components/Register'
import Home from './components/Home'
//rgb(146, 134, 168); background
function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />}></Route>
        <Route path="/signup" element={<Register />}></Route>
        <Route path="/main" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
