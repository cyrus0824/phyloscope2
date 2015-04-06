(function(jQuery) {
    jQuery.widget("phylotree", {
        options: {
            lineHeight: 0,
            branchThickness: 0,
            inputFormat: 'newick',
            treeString: '',
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
            
            // get JSON object of tree
            if(this.options.inputFormat=='newick') {this.JSONtree = this.newickParse(this.options.treeString)}
            else if(this.options.inputFormat=='phyloxml') {}
            else {
                // don't understand the format
            }

            console.log(this.JSONtree);
            this.refresh()
        },

        _refresh: function() {
        },

        _destroy: function() {

        },

        _newickParse: function(s) {
            // newick string parser courtesy of Jason Davies (newick.js) at
            // https://github.com/jasondavies/newick.js
            var ancestors = [];
            var tree = {};
            var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
            for (var i=0; i<tokens.length; i++) {
              var token = tokens[i];
              switch (token) {
                case '(': // new branchset
                  var subtree = {};
                  tree.branchset = [subtree];
                  ancestors.push(tree);
                  tree = subtree;
                  break;
                case ',': // another branch
                  var subtree = {};
                  ancestors[ancestors.length-1].branchset.push(subtree);
                  tree = subtree;
                  break;
                case ')': // optional name next
                  tree = ancestors.pop();
                  break;
                case ':': // optional length next
                  break;
                default:
                  var x = tokens[i-1];
                  if (x == ')' || x == '(' || x == ',') {
                    tree.name = token;
                  } else if (x == ':') {
                    tree.length = parseFloat(token);
                  }
              }
            }
            return tree;
        }
    });
}(jQuery));
