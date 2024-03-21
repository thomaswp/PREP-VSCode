import { ActionHandler } from "./ActionHandler";
import { config } from "./config";
import { State } from "./State";


export class EventHandler {

    actionHandler: ActionHandler;

    constructor(actionHandler: ActionHandler) {
        this.actionHandler = actionHandler;
    }

    handleEvent(type: "Submit" | "File.Edit" | "RequestScore", data: State, silently = false) {
        for (const [endpointName, endpoint] of Object.entries(config.endpoints)) {
            if (endpoint.events[type] !== undefined) {
                let url = endpoint.baseUrl + endpoint.events[type];
                fetch(url, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }).then((response) => {
                    if (silently) {
                        return;
                    }
                    response.json().then((data) => {
                        console.log("Receiving action", data);
                        this.actionHandler.handleActions(data);
                    }).catch((error) => {
                        this.actionHandler.handleError(error);
                    });
                }).catch((error) => {
                    this.actionHandler.handleError(error);
                });
            }
        }
    }
}