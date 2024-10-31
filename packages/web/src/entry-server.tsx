import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from "react-router-dom/server";

import App from './App'

interface IRenderProps {
  path: string;
}

export function render({ path }: IRenderProps) {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <StaticRouter location={path}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  )
  return { html }
}
