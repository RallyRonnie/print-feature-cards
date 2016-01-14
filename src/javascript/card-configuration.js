Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","State","Owner","Description",
        "Notes","Milestones","TargetDate","Project",'c_MoSCoW'],
    
    
    displayFields: {
        r1left: {
            dataIndex: function(record){
                return record.get('FormattedID') + ': ' +record.get('Name');
            },
            maxLength: 34
        },
        r1right: {
            dataIndex: function(recordData){     
                var milestones = recordData.get('Milestones');
                
                if ( Ext.isEmpty(milestones) || milestones.Count === 0 || Ext.isEmpty(recordData.get('__Milestone')) ) {
                    return "No Entry";
                }
                var target_date = recordData.get('__Milestone').get('TargetDate');
                var quarters_by_month = [1,1,1,2,2,2,3,3,3,4,4,4];
                
                return Ext.String.format("{0}Q{1}.{2}",
                    Ext.Date.format(target_date, 'Y'),
                    quarters_by_month[parseInt( Ext.Date.format(target_date,'m') ) - 1],
                    Ext.Date.format(target_date, 'M')
                );
            }
        },
        r2left: {
            dataIndex: function(recordData) { return recordData.get('Project').Name; },
            maxLength: 20
        },
        r2middle: {
            dataIndex: function(recordData){
                return recordData.get('Owner') && recordData.get('Owner')._refObjectName || "None";
            },
            maxLength: 20
        },
        r2right: {
            dataIndex: function(recordData) {
                return recordData.get('c_MoSCoW') || "None";
            }
        },
        r3middle: {
            dataIndex: function(recordData) {
                var description = recordData.get('Description');
                
                if ( Ext.isEmpty(description) ) {
                    return "--";
                }
                
                return description.replace(/<(?:.|\n)*?>/gm, '');
            },
            maxLength: 155
        },
        r4middle: {
            dataIndex: function(recordData) {
                var template = "SYSTEMS: ({0}) {1}<br/>" +
                               "TEAMS : ({2}) {3}"
                
                var asset_list = [];
                var team_list = [];
                
                var stories = recordData.get('__Stories');
                if ( !Ext.isEmpty(stories) && stories.length > 0 ) {
                    team_list = Ext.Array.map(stories, function(story) { return story.get("Project").Name; });
                    team_list = Ext.Array.unique(team_list);
                    
                    asset_list = [];
                    Ext.Array.each(stories, function(story) { 
                        var system = story.get('c_System');
                        if ( !Ext.isEmpty(system) ) {
                            asset_list.push(system); 
                        }
                    });
                    asset_list = Ext.Array.unique(asset_list);
                }
                
                return Ext.String.format(template, 
                    asset_list.length,
                    asset_list.join(', '),
                    team_list.length,
                    team_list.join(', ')
                );
            },
            maxLength: 255
        }
    }
});
