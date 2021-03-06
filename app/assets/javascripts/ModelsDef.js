/**
 * ModelsDef.js
 */

(function(PlayStory) {

    PlayStory.ModelsDef = new (function() {
        var self = this,
            bucket = PlayStory.Bucket;

        this.asFeed = function(data) {
            var projects = bucket.collections("projects").get(),
                project = projects.filter(function(project) {
                    return project.name == data.log.project;
                })[0];

            var feed = {
                id: data.log._id,
                realName: project ? project.realName : '',
                project: {
                    name: project ? project.name : ''
                },
                avatar: project ? project.avatar : '',
                time: new Date(data.log.date),
                level: data.log.method,
                message: data.log.message,
                comments: data.log.comments || []
            };
            return feed;
        };
    })();
})(window.PlayStory);