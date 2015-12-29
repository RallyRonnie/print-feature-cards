Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","State","Owner","InvestmentCategory","Description","Notes","Milestones","TargetDate"],
    displayFields: {
        r1left: {
            dataIndex: function(recordData){
                return recordData.FormattedID + ': ' + recordData.Name;
            },
            maxLength: 40
        },
        r1right: {
            dataIndex: function(recordData){
                console.log('rd:', recordData);
                
                if ( Ext.isEmpty(recordData.Milestones) || recordData.Milestones.Count === 0 || Ext.isEmpty(recordData.__Milestone) ) {
                    return "No Entry";
                }
                return recordData.__Milestone.get('Name');
            }
        },
        r2left: {
            dataIndex: 'Name',
            maxLength: 20
        },
        r2middle: {
            dataIndex: function(recordData){
                return recordData.Owner && recordData.Owner.DisplayName || "None";
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
