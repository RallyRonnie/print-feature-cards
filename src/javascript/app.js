Ext.define("print-feature-cards", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    features: [],
    
    launch: function() {
        this.down('#display_box').add({
            xtype: 'rallybutton',
            text: 'Open Print Cards',
            scope: this,
            handler: this._gatherData
        });
    },
    
    _gatherData: function(){
        var feature_fields = Rally.technicalservices.CardConfiguration.fetchFields;
        
        var promise_functions = [this._loadFeatures];
        
        if ( Ext.Array.contains(feature_fields, "Milestones")) {
            promise_functions.push(this._loadMilestones);
        }
        
        Deft.Chain.sequence(promise_functions,this).then({
            scope: this,
            success: function(results) {
                this._openPrintCards(results[0]);
            },
            failure: function(msg) {
                Ext.Msg.alert("Problem printing cards", msg);
            }
        });

    },
    
    _loadFeatures: function() {
        var deferred = Ext.create('Deft.Deferred');
        
        var config = {
            model: 'PortfolioItem/Feature',
            fetch: Rally.technicalservices.CardConfiguration.fetchFields
        };
        
        this._loadWsapiRecords(config).then({
            scope: this,
            success: function(features) {
                this.logger.log(Ext.String.format("Found {0} features", features.length));
                this.features = features;
                deferred.resolve(features);
            },
            failure: function(msg) {
                deferred.reject(msg);
            }
        });

        return deferred.promise;
    },
    
    _loadMilestones: function() {
        var deferred = Ext.create('Deft.Deferred');
        
        var milestone_names = [];
        Ext.Array.each(this.features, function(feature){
            if ( feature.get('Milestones') && feature.get('Milestones').Count > 0 ) {
                Ext.Array.each(feature.get('Milestones')._tagsNameArray, function(tag){
                    milestone_names.push(tag.Name);
                });
            }
        });
        
        this.logger.log('milestones:', milestone_names);
        
        var unique_names = Ext.Array.unique( Ext.Array.flatten(milestone_names) );
        
        var config = {
            model: 'Milestone',
            fetch: ['Name','TargetDate']
        };
        
        if ( unique_names.length > 0 ) {
            var filter_array = Ext.Array.map(unique_names, function(name){
                return { property:'Name', value: name };
            });
            
            config.filters = Rally.data.wsapi.Filter.or(filter_array);
        }
                
        this._loadWsapiRecords(config).then({
            scope: this,
            success: function(milestones) {
                var milestones_by_name = {};
                Ext.Array.each(milestones, function(milestone){
                    milestones_by_name[milestone.get('Name')] = milestone;
                });
                
                Ext.Array.each(this.features, function(feature){
                    feature.set('__Milestone', "");
                    
                    if ( feature.get('Milestones') && feature.get('Milestones').Count > 0 ) {
                        var ms = feature.get('Milestones')._tagsNameArray[0];
                        feature.set('__Milestone', milestones_by_name[ms.Name]);
                    }
                });
                
                deferred.resolve(milestones);
            },
            failure: function(msg) {
                deferred.reject(msg);
            }
        });
        
        return deferred.promise;
    },
    
    
    _loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        this.logger.log('_loadWsapiRecords', config);
        
        var me = this;
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID']
        };

        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    _openPrintCards: function(records){
        this.logger.log('_openPrintCards', records);
        
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
