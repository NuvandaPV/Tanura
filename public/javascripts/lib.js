'use strict';

/*
 * Tanura internal library.
 *
 * This script defines plumbing specific to Tanura, that is not meant for use by 
 * the end-user.
 */

(function() {

    /*
     * Create an alias for an event.
     *
     * This will fire a given event whenever another given event is fired.  The 
     * return value indicates success.  The callback parameter will be carried 
     * through to the new event.
     */
    var aliasEvent = function(alias, event) {
        return this.register(event, function(x) {
            return this.fire(alias, x);
        }, this);
    }.bind(tanura.eventHandler);

    /*
     * Group a list of events into another event.
     *
     * This will fire a given event whenever an event from a given list fires.  
     * The return value will be true, if the grouping succeeded, false 
     * otherwise. If the grouping fails due to some of the grouped events not 
     * existing the rest will still be grouped. The callback parameter will be 
     * propagated to the new event.
     */
    var groupEvents = function(_, l) {
        var r = true;
        for (var i of l) { if (! aliasEvent(_, i)) { r = false; } }
        return r;
    }.bind(tanura.eventHandler);


    /*
     * Add local and remote subevents.
     *
     * This will add a _local and an _remote event for a given event that gets 
     * a stream as its parameter. The local event will only be fired for events 
     * on a local stream and the remote event for all others. The return value 
     * indicates success. Calling this on an event that does not get a stream 
     * will not lead to an error, as this is unknown at runtime.  Missing 
     * subevents are silently ignored.
     */
    var splitStreamEvent = function(_) {
        return this.register(_, function(x) {
            return this.fire(
                    _ + (x.getID() == tanura.erizo.localStream.getID()
                        ? '_local' : '_remote'),
                    x);
        }, this);
    }.bind(tanura.eventHandler);

    aliasEvent('media_denied', 'media_denied_fallback');

    groupEvents(
            'media_granted',
            ['media_granted_preferred', 'media_granted_fallback']);
    groupEvents(
            'whiteboard_updated',
            ['whiteboard_edited', 'whiteboard_changed']);
    groupEvents(
            'whiteboard_initialized',
            ['whiteboard_created', 'whiteboard_loaded']);

    for (var i of ['added', 'failed', 'removed', 'throttled']) {
        splitStreamEvent('stream_' + i);
    }

})();
