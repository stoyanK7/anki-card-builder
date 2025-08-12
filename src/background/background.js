import { startCardBuildingWorkflow } from './start-workflow.js';
import { endCardBuildingWorkflow } from './end-workflow.js';
import { setupContextMenus } from './context-menus.js';

setupContextMenus();

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'start-card-building-workflow') {
        startCardBuildingWorkflow(message.frenchWord);
    }
    if (message.action === 'end-card-building-process') {
        endCardBuildingWorkflow(message.frenchWord, message.deckName);
    }
});

