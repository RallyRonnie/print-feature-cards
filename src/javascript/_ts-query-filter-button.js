Ext.define('Rally.techservices.QueryButton', {
    extend: 'Rally.ui.Button',
    alias:'widget.tsquerybutton',
    config:{
        border: 0,
        
        text: '<span class="icon-filter"> </span>Q',

        cls: 'small-icon secondary rly-small',
        
        margin: '3px 10px 3px 0px',
        /**
         * @cfg {String} elTooltip
         * Rendered as html title attribute on the Button's top-level element if toolTipConfig not specified.
         * This is different than the the tooltip config in that it will put the tooltip on the top-level el rather than the button html element.
         */
        elTooltip: 'Click to make a raw query',
        
        query: ''
    },
    
    initComponent: function() {
        var me = this;

        me.addEvents(
            /**
             * @event querychanged
             * Fires when the query is changed via the dialog
             * @param {Rally.techservices.QueryButton} this
             * @param {String} query The text in the query
             */
            'querychanged'
        );
        
        me.callParent(arguments);

    },
    
    onRender: function() {
        this.callParent(arguments);
        
        var btn = this.el;
        this.mon(btn, this.clickEvent, this._showQueryDialog, this);
    },
    
    _showQueryDialog: function() {
        var button = this;
        
        this.dialog = Ext.create('Rally.ui.dialog.Dialog', {
            id       : 'popup',
            width    : 400,
            height   : 200,
            title    : 'Manual Query',
            autoShow : true,
            closable : true,
            layout   : 'border',
            items    : [{
                xtype  : 'textareafield',
                id     : 'querytext',
                region : 'center',
                value  : button.query
            }, {
                xtype : 'container',
                region: 'south',
                layout: 'hbox',
                items : [
                    { xtype: 'container', flex: 1},
                    { 
                        xtype: 'rallybutton', 
                        cls: 'secondary', 
                        text:'Cancel', 
                        listeners: { scope: button, click: button._closeDialog } 
                    },
                    { 
                        xtype: 'rallybutton', 
                        cls: 'primary',   
                        text:'Save', 
                        listeners: { scope: button, click: button._setQuery } 
                    },
                    { xtype: 'container', flex: 1}
                ]
            }]
        });
    },
    
    _closeDialog: function() {
        this.dialog && this.dialog.destroy();
    },
    
    getQuery: function() {
        return this.query;
    },
    
    _setQuery: function() {
        var me = this;
        
        var field = me.dialog.down('textareafield');
        me.query = field.getValue();
        
        if ( Ext.isEmpty(me.query) ) {
            me.removeCls('primary');
            me.addCls('secondary');
        } else {
            me.removeCls('secondary');
            me.addCls('primary');
        }
        me.fireEvent('querychanged', me, me.query);
        
        this._closeDialog();
    }
});