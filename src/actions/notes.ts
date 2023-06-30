// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "microsoft-graph";
import { deleteNote, getNotes, postNote } from "../api/notes";
import { AppContext } from "../azure/AppContext";
import { FETCH_NOTES_DATA, DELETE_NOTES_DATA, POST_NOTE_DATA } from "./types";
import { defaultFetchHandler, defaultPostHandler } from "./defaults";


export function fetchNotesData() {
  return defaultFetchHandler(getNotes, FETCH_NOTES_DATA)
}

type deleteNoteDataParams = {
  app: AppContext,
  noteId: string,
}

export const deleteNoteData = createAsyncThunk<
  string | boolean,
  deleteNoteDataParams
  >(
    DELETE_NOTES_DATA,
    async ({ noteId, app }: deleteNoteDataParams) => {
      if (app.user) {
        try {
          await deleteNote(app.authProvider!, noteId);
          return noteId;
        } catch (err) {
          const error = err as Error;
        app.displayError!(error.message);
        return false;
        }
      }
      return false;
    }
  );


export function postNoteData(...endpointProps: [Message]) {
  return defaultPostHandler(postNote, POST_NOTE_DATA, ...endpointProps)
}