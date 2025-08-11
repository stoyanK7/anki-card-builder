import { startCardBuildingProcess } from './card-workflow.js';
import {setupContextMenus} from './context-menus.js';

setupContextMenus();

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'create-notification') {
        browser.notifications.create(message.id, message.options);
        setTimeout(() => {
            browser.notifications.clear(message.id);
        }, 5000);
    }
    if (message.action === 'start-card-building-process') {
        startCardBuildingProcess(message.frenchWord);
    }
});

