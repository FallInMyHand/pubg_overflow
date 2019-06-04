define(['app/utils/events', 'app/model/AbstractWindow', 'app/services/playerDatabase'], function(EventsEmitter, AbstractWindow, database) {
    class Settings extends AbstractWindow {
        constructor(platform, eventBus) {
            super('settings', platform, eventBus);
        }
    }

    return Settings;
});