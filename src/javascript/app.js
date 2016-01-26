Ext.define("print-feature-cards", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 5 },
    items: [
        {xtype:'container',itemId:'display_box'},
        {xtype:'container', itemId:'message_box', tpl: '<tpl>{message</tpl>' }
    ],

    features: [],
    
    launch: function() {
        var container = this.down('#display_box');
        
        this.filterButton = container.add({
            xtype: 'rallycustomfilterbutton',
            modelNames: ['PortfolioItem/Feature'],
            context: this.context,
            listeners: {
                customfilter: {
                    fn: this._setFilter,
                    single: false,
                    scope: this
                }
            }
        });
        
        container.add({
            xtype: 'rallybutton',
            text: 'Open Print Cards',
            scope: this,
            margin: 3,
            handler: this._gatherData
        });
    },
    
    _setFilter: function(button) {
        if ( this.filterButton) {
            this.filters = this.filterButton.getFilters();
        } else {
            this.filters = button.getFilters();
        }
        
//        if ( this.filters && this.filters.length > 0 ) {
//            console.log(this.filters);
//            exit();
//            // message_box
//        }
    },
    
    _gatherData: function(){
        var feature_fields = Rally.technicalservices.CardConfiguration.fetchFields;
        this.setLoading("Gathering data...");
        
        Deft.Chain.sequence([
            this._loadFeatures,
            this._loadMilestones,
            this._loadStories
        ],this).then({
            scope: this,
            success: function(results) {
                this._openPrintCards(results[0]);
                this.setLoading(false);
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
        
        if ( this.filters ) {
            config.filters = this.filters;
        }
        
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
        
        if ( milestone_names.length === 0 ) {
            return [];
        }
        
        var unique_names = Ext.Array.unique( Ext.Array.flatten(milestone_names) );
        
        var config = {
            model: 'Milestone',
            fetch: ['Name','TargetDate']
        };
        
        this.logger.log('--');
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
    
    _loadStories: function() {
        var deferred = Ext.create('Deft.Deferred');
        this.logger.log('_loadStories');
        
        if ( this.features.length === 0 ) {
            return [];
        }
        
        var feature_oids = Ext.Array.map(this.features, function(feature){
            return feature.get('ObjectID');
        });
        
        var chunker = Ext.create('Rally.technicalservices.data.Chunker',{
            chunkOids: feature_oids,
            chunkField: 'Feature.ObjectID',
            fetch: ['Name','Feature','Project','ObjectID','c_System'],
            model: 'HierarchicalRequirement'
        });
        chunker.load().then({
            scope: this,
            success: function(stories){
                this.logger.log('chunker success', stories);
                var stories_by_feature_oid = {};
                Ext.Array.each(stories, function(story){
                    if (!stories_by_feature_oid[story.get('Feature').ObjectID]) {
                        stories_by_feature_oid[story.get('Feature').ObjectID] = [];
                    }
                    stories_by_feature_oid[story.get('Feature').ObjectID].push(story);
                });
                                
                Ext.Array.each(this.features, function(feature){
                    var feature_oid = feature.get('ObjectID');
                    var stories = stories_by_feature_oid[feature_oid] || [];
                    
                    feature.set('__Stories', stories);
                });
                
                deferred.resolve(stories);
            },
            failure: function(){
                alert('failed');
                deferred.reject('failed');
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
            maxLength: 200,
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
        win.print();
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
