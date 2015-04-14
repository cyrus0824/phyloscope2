jQuery(function() {
    jQuery.widget("custom.phylotree", {
        options: {
            lineHeight: 0,
            branchThickness: 0,
            inputFormat: 'newick',
            treeString: '',
            // which columns should we annotate?
            //annotationColumns: "columns=id,entry name,ec,go,go-id,genes,length,taxon,organism,organism-id,pathway,protein names,reviewed,version",            
            annotationColumns: "columns=citation,clusters,comments,domains,domain,ec,id,entry name,existence,families,features,genes,go,go-id,interpro,interactor,keywords,last-modified,length,organism,organism-id,pathway,protein names,reviewed,sequence,3d,taxon,tools,version,virus hosts",
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
            // get JSON object of tree
            if(this.options.inputFormat=='newick') {this.JSONtree = this._newickParse(this.options.treeString)}
            else if(this.options.inputFormat=='phyloxml') {}
            else {
                // don't understand the format
            }
            

            // get the root of the tree structure
            this.tree = this._createTree(this.JSONtree);

            //console.log(this);
            this._refresh();
        },

        _refresh: function() {
        },

        _destroy: function() {

        },
        _createTree: function() {
            // function that turns the parsed json object into 
            // the internal tree structure
            var tree = {};
            var that = this;            
            var unpackJSONtree = function(node) {
                var thisNode = {};
                thisNode.children = [];
                
                // get this node's length and name, if applicable
                if(node.hasOwnProperty('length')) {thisNode.distanceToParent = parseFloat(node['length']);}
                if(node.hasOwnProperty('name')) {thisNode.name = node['name'];}
                // recursively call this function
                if(node.hasOwnProperty('branchset')) {
                    for(var i=0; len=node['branchset'].length, i<len; i++) {thisNode.children.push(unpackJSONtree(node['branchset'][i]));}
                }
                return thisNode;
            };

            tree.root = unpackJSONtree(this.JSONtree);
            
            // traverses this tree and applies l to every node
            tree.postOrderTraversal = function(l) {
                var f = function(node) {
                    for(var i=0; len=node.children.length, i<len; i++) {f(node.children[i]);}
                    l(node);
                };
                f(tree.root);
            };

            // annotate one node
            var annotateNode = function(node) {
                // try to see what format this identifier is
                if(node.hasOwnProperty('name')) {
                    node.annotations = {};
                    // is this a uniprot accession?
                    var uniprotAccession1 = new RegExp("[OPQ][0-9][A-Z0-9][A-Z0-9][A-Z0-9][0-9]");
                    var uniprotAccession2 = new RegExp("[A-NR-Z][0-9][A-Z][A-Z0-9][A-Z0-9][0-9]");
                    var uniprotAccession3 = new RegExp("[A-NR-Z][0-9][A-Z][A-Z0-9][A-Z0-9][0-9][A-Z0-9][A-Z0-9][A-Z0-9][0-9]");
                    var swissprotIdentifier = new RegExp("[A-Z0-9]{1,5}_[A-Z0-9]{1,5}");
                    var thisQueryObject = {};
                    if(uniprotAccession1.exec(node.name)) {thisQueryObject = {'query': uniprotAccession1.exec(node.name)[0], 'term': 'accession'};}
                    else if(uniprotAccession2.exec(node.name)) {thisQueryObject = {'query': uniprotAccession2.exec(node.name)[0], 'term':'accession'};}
                    else if(uniprotAccession3.exec(node.name)) {thisQueryObject = {'query': uniprotAccession3.exec(node.name)[0], 'term':'accession'};}
                    else if(swissprotIdentifier.exec(node.name)) {thisQueryObject = {'query': swissprotIdentifier.exec(node.name)[0], 'term': 'mnemonic'};}
                    // can't find an annotation
                    else {return null;}
                    // try to get annotations for this node
                    jQuery.get("http://www.uniprot.org/uniprot/?query=" + thisQueryObject.term + ":" + thisQueryObject.query + "&" + that.options.annotationColumns + "&format=tab&limit=1", function(data) {
                        // callback with data for this node
                        if(data.split("\n").length>=2) {
                            var thisKeyLine = data.split("\n")[0].split("\t");
                            var thisAnnotationLine = data.split("\n")[1].split("\t");
                            for(var i=0; i<thisKeyLine.length; i++) {node.annotations[thisKeyLine[i]] = thisAnnotationLine[i];}
                        }
                        else node.annotations = {}
                    });
                }
            }; 
            
            // annotate tree
            tree.postOrderTraversal(annotateNode);

            tree.drawTree = function() {
                // function that draws this tree
            };
            tree.drawTree();
            console.log(tree);
            return tree; 
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
