// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Suspense } from "react";

import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";


 function makeLoadableComponent(loader) {
  const AsyncComponent = React.lazy(loader);
  const LoadableCompoenent = () => ( // TODO: Create loader component
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  );
  return LoadableCompoenent;
}

function makeAuthenticatedElement(AsyncComponent, childProps) {
  return <RequireAuth>
    <AsyncComponent {...childProps}/>
  </RequireAuth>
}

// Create async components
const AsyncLogin = makeLoadableComponent(() => import("./containers/Login"));
const AsyncMenu = makeLoadableComponent(() => import("./containers/Menu"));
const AsyncMessages = makeLoadableComponent(() => import("./containers/Messages"));
const AsyncNewMessage = makeLoadableComponent(() => import("./containers/NewMessage"));
const AsyncCalendar = makeLoadableComponent(() => import("./containers/Calendar"));
const AsyncNewEvent = makeLoadableComponent(() => import("./containers/NewEvent"))
const AsyncTasks =  makeLoadableComponent(() => import('./containers/Tasks'));
const AsyncPeople =  makeLoadableComponent(() => import('./containers/People'));

const AppRoutes = ({ childProps }) => (
  <Routes>
    <Route
      path="/login"
      element={<AsyncLogin {...childProps}/>}
    />
    <Route
      path="/"
      element={makeAuthenticatedElement(AsyncMenu, childProps)}
    />
    <Route
      path="/messages"
      element={makeAuthenticatedElement(AsyncMessages, childProps)}
    />
    <Route
      path="/newMessage"
      element={makeAuthenticatedElement(AsyncNewMessage, childProps)}
    />
    <Route
      path="/calendar"
      element={makeAuthenticatedElement(AsyncCalendar, childProps)}
    />
    <Route
      path="/tasks"
      element={makeAuthenticatedElement(AsyncTasks, childProps)}
    />
    <Route
      path="/people"
      element={makeAuthenticatedElement(AsyncPeople, childProps)}
    />
    <Route
      path="/newevent"
      element={makeAuthenticatedElement(AsyncNewEvent, childProps)}
    />
  </Routes>
);

export default AppRoutes;
