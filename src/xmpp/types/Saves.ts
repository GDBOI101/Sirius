import WebSocket from "ws";

let ConnectedClients = new Map<string, WebSocket>();
let Received = "";
let resource: string = "";
let clientExists: boolean = false;
let JoinedMUCs: any[] = [];

export const Saves = {
  ConnectedClients,
  Received,
  resource,
  clientExists,
  JoinedMUCs,
};
