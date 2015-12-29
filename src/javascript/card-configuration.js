Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","State","Owner","InvestmentCategory","Description","Notes","Milestones","TargetDate"],
    
    
    displayFields: {
        r1left: {
            dataIndex: function(record){
                return record.get('FormattedID') + ': ' +record.get('Name');
            },
            maxLength: 40
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
            dataIndex: 'Name',
            maxLength: 20
        },
        r2middle: {
            dataIndex: function(recordData){
                return recordData.get('Owner') && recordData.get('Owner').DisplayName || "None";
            },
            maxLength: 20
        },
        r2right: {
            dataIndex: 'InvestmentCategory'
        },
        r3middle: {
            dataIndex: 'Description',
            maxLength: 255
        },
        r4middle: {
            dataIndex: 'Notes',
            maxLength: 255
        }
    }
});
