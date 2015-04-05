/* Phylogenetic tree jquery widget */

jQuery(function() {
    jQuery.widget("phyloscope2.tree", {
        options: {
            lineHeight: 0,
            branchThickness: 0,
            // Callback functions for events
            nodeMouseOver: null,
            nodeMouseOut: null,
            nodeMouseMove: null,
            nodeMouseUp: null,
            nodeMouseDown: null,
            branchMouseOver: null,
            branchMouseOut: null,
            branchMouseMove: null,
            branchMouseUp: null,
            branchMouseDown: null
        },

        // widget constructor
        _create: function() {
            // instance private variables
            this.shit = "balls";
        },

        _refresh: function() {

        },

        _destroy: function() {

        },
        
    });


