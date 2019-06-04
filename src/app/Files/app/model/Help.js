define(['app/utils/events', 'app/model/AbstractWindow'], function(EventsEmitter, AbstractWindow) {
    class Roster extends AbstractWindow {
        constructor(platform, eventBus) {
            super('help', platform, eventBus);
        }
    }

    return Roster;
});