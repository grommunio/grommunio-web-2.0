// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { PageCollection } from "@microsoft/microsoft-graph-client";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { CategoryColor, Message } from "microsoft-graph";
import { buildQuery } from "../utils";
import { ensureClient, graphClient } from "./utils";
import { MessageCategory } from "../types/messages";

export async function getUserMessages(folderid = 'inbox', params={}): Promise<Message[]> {
  const url = buildQuery(`/me/mailFolders/${folderid}/messages`, params);

  const response: PageCollection = await graphClient!
    .api(url)
    .get();

  return response.value;
}


export async function postMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  message: Message, send: boolean): Promise<Message> {
  ensureClient(authProvider);
  
  return await graphClient!
    .api('/me/' + (send ? 'sendMail' : 'messages'))
    .post(send ? { message } : message);
}

export async function postMessageForward(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  message: Message, forward: any /*TODO: Find proper forward mail type */): Promise<string | undefined> {
  ensureClient(authProvider);
  
  const response = await graphClient!
    .api('/me/messages/'+ message.id + "/forward")
    .post(forward);

  return response?.message;
}

export async function patchMessage(message: Message, specificProps: any): Promise<Message | undefined> {
  
  const response = await graphClient!
    .api('/me/messages/'+ message.id)
    .patch(specificProps || message);

  return response;
}

export async function deleteMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  id: string, force=false): Promise<string | undefined> {
  ensureClient(authProvider);
  
  
  const response = force ? await graphClient! // Full delete
    .api('/me/messages/'+ id)
    .delete() : await graphClient! // Move to deleted items
      .api('/me/messages/'+ id + "/move")
      .post({ destinationId: "deleteditems" });

  return response?.message;
}

export async function moveMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  id: string, destinationId: string): Promise<string | undefined> {
  ensureClient(authProvider);
  
  
  const response = await graphClient!
    .api('/me/messages/'+ id + "/move")
    .post({ destinationId });

  return response?.message;
}

export async function copyMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider | undefined,
  id: string, destinationId: string): Promise<string | undefined> {
  ensureClient(authProvider!);
  
  
  const response = await graphClient!
    .api('/me/messages/'+ id + "/copy")
    .post({ destinationId });

  return response?.message;
}

export async function mailCategories(): Promise<CategoryColor[]> {
  
  const response = await graphClient!
    .api("/me/outlook/masterCategories")
    .get();

  return response.value;
}

export async function postMailCategory(category: MessageCategory): Promise<MessageCategory> {

  const response = await graphClient!
    .api("/me/outlook/masterCategories")
    .post(category);

  return response;
}
