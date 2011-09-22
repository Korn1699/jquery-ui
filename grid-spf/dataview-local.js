/*
 * Local Dataview
 *
 * Depends on:
 * dataview
 */
(function ($, undefined ) {

// custom dataview for local paging/sorting/filter, accepts a input option
$.widget( "ui.localDataview", $.ui.dataview, {
	// all dataview implementations share a common event prefix
	widgetEventPrefix: "dataview",
	_create: function() {
		var that = this;
		this.options.source = function( request, response) {
			var sortedItems = that._sort( that._filter( that.options.input ) );
			response( that._page( sortedItems ), sortedItems.length );
		};
		if ( $.observable ) {
			$.observable( this.options.input ).bind( "insert remove", function(event, ui) {
				that.refresh();
			});
		}
	},
	_filter: function( items ) {
		if ( this.options.filter ) {
			var that = this;
			return $.grep( items, function ( item ) {
				var property,
					filter,
					match = true;
	            for ( property in that.options.filter ) {
					filter = that.options.filter[ property ];
					match &= that._match( item[ property ], filter );
				}
				return match;
	        });
		}
		return items;
	},
	_match: function( value, filter ) {
		var operator = filter.operator || "==",
			operand = filter.value || filter;
		switch (operator || "==") {
            case "==": return value == operand;
            case "!=": return value != operand;
            case "<": return value < operand;
            case "<=": return value <= operand;
            case ">": return value > operand;
            case ">=": return value >= operand;
			case "like": return new RegExp( operand.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" ), "i" ).test( value );
            default: throw "Unrecognized filter operator: " + operator + " for operand " + operand;
        }
	},
	_sort: function( items ) {
		/*
		function extract( row ) {
			var text = $( $( row ).children()[ index ] ).text();
			if ( type === "currency" ) {
				return Globalize.parseFloat( text, culture );
			} else if ( type === "date" ) {
				return Globalize.parseDate( text, format, culture );
			} else {
				return text;
			}
		}

		var head = $( this ),
			culture = head.data( "culture" ),
			format = head.data( "format" ),
			type = head.data( "type" ),
			order = head.data( "sort-order" ) || 1,
			index = this.cellIndex;
		*/
		function sorter( property, secondary ) {
			var order = property.charAt( 0 ) == "-" ? -1 : 1;
			return function ( item1, item2 ) {
                var value1 = item1[ property ],
                    value2 = item2[ property ];
                if ( value1 == value2 ) {
					if ( secondary.length ) {
						var next = secondary[ 0 ];
						return sorter( next, secondary.slice( 1 ) )( item1, item2 );
					}
					return 0;
				}
				return order * ( value1 > value2 ? 1 : -1 );
            };
		}
		if ( this.options.sort.length ) {
			// if unfiltered, make a copy to not sort the input
			if ( items === this.options.input ) {
				items = items.slice( 0 );
			}
			var sorts = this.options.sort;
			var first = sorts[ 0 ];
        	return items.sort( sorter( first, sorts.slice( 1 ) ) );
		}
		return items;
	},
	_page: function( items ) {
		var paging = this.options.paging,
			limit = paging.limit || items.length;
		return items.slice( paging.offset, paging.offset + limit );
	}
});

})(jQuery);
