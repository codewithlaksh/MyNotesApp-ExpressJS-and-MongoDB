module.exports = {
    datetime: function(datetime) {
        return new Date(datetime).toLocaleDateString();
    },
    truncate: function(text, limit) {
        if (text.length > limit) {
            return text.slice(0, limit) + '...';
        } else {
            return text;
        }
    },
    capitalize: function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1)
    }
}