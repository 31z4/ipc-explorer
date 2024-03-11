import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashRouter } from "react-router-dom"
import Root from './routes/root'
import Subnet from './routes/subnet'

// GitHub pages doesn't support browser router out of the box.
const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "subnets/*",
    element: <Subnet />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
