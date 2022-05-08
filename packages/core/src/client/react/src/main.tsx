import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Layout from "../components/layout";
import { useRoutes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import NoMatch from "./pages/404";
import Index from "./pages";
import { config } from "site-config";
const AppRouters: RouteObject[] = [
  {
    path: "/",
    children: [
      {
        path: "/",
        index: true,
        element: <Index />,
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "404",
            element: <NoMatch />,
          },
        ],
      },
    ],
  },
];

function App() {
  console.log(config);
  // console.log(documents);
  let element = useRoutes(AppRouters);
  return <>{element}</>;
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
