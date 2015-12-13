Ext.define("print-feature-cards", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    launch: function() {
        this.down('#display_box').add({
            xtype: 'rallybutton',
            text: 'Open Print Cards',
            scope: this,
            handler: this._loadFeatures
        });
    },
    _loadFeatures: function(){


        Ext.create('Rally.data.wsapi.Store',{
            autoLoad: true,
            model: 'PortfolioItem/Feature',
            fetch: Rally.technicalservices.CardConfiguration.fetchFields,
            listeners: {
                scope: this,
                load: function(store,records,success){
                    this._openPrintCards(records);
                }
            }

        });
    },
    _openPrintCards: function(records){

        var fields =[{
            dataIndex: 'Name',
            maxLength: 100,
            cls: 'card-title'
        },{
            dataIndex: 'FormattedID',
            cls: 'card-id'
        }];

        var win = Ext.create('Rally.technicalservices.window.PrintCards',{
            records: records,
            displayFields: fields,
            currentDocument: Ext.getDoc()
        });
        win.show();
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
    
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        Ext.apply(this, settings);
        this.launch();
    }
});
