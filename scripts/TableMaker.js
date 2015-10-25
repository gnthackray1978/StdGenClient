var TableMaker = function() {
    this.selectorTools = new SelectorTools();
    this.pager = new Pager();
    this.qryStrUtils = new QryStrUtils();
    //
    this.selection = [];
}

TableMaker.prototype = {
    MakeBody : function(batchContents, pagerparams){
        
        var tableBody = '';
        var selectEvents = [];
    
        var that = this;

        $.each(batchContents, function (index, value) {
            tableBody += that.makeRow(value, selectEvents);  
        });

        if (tableBody !== '') {
            $('#search_bdy').html(tableBody);
            //create pager based on results

            this.pager.createpager(pagerparams);
            that.UpdateRecordCount(pagerparams.Total);
        }
        else {
            $('#search_bdy').html(tableBody);
            that.UpdateRecordCount('0');
        }

        this.selectorTools.addlinks(selectEvents, this.processSelect, this);
        
    },
    
    makeRow : function(rowData, selectEvents){
        
        var that = this;
        var tableRow = '';
        
        var hidPID = '<input type="hidden" name="RowId" id="RowId" value ="' + rowData.id + '"/>';

        var arIdx = jQuery.inArray(rowData.id, that.selection);

        if (arIdx >= 0) {
            tableRow += '<tr class = "highLightRow">' + hidPID;
        }
        else {
            tableRow += '<tr>' + hidPID;
        }


        var _loc = window.location.hash;
        _loc = that.qryStrUtils.updateStrForQry(_loc, 'id', rowData.id);

        
        tableRow += that.makeColumn(rowData.idx, rowData.id, rowData.column1.isLink, rowData.column1.ref,selectEvents);
        tableRow += that.makeColumn(rowData.idx, rowData.id, rowData.column2.isLink, rowData.column2.ref);
        tableRow += that.makeColumn(rowData.idx, rowData.id, rowData.column3.isLink, rowData.column3.ref);
        tableRow += that.makeColumn(rowData.idx, rowData.id, rowData.column4.isLink, rowData.column4.ref);
        tableRow += that.makeColumn(rowData.idx, rowData.id, rowData.column5.isLink, rowData.column5.ref);
        
        tableRow += '</tr>';
        
        return tableRow;
    },
    
    makeColumn : function(idx,id, isLink, ref, evtCollection ){
            
        var col = '';
        
        if(evtCollection && isLink){
            col = '<td><a id= "s' + idx + '" href="" ><div>' + ref + '</div></a></td>';
            evtCollection.push({ key: 's' + idx, value: id });
            return col;
        }
        
        if(isLink){
            col = '<td><a href ><div>' + ref + '</div></a></td>';
        }
        else
        {
            col = '<td><div>' + ref + '</div></td>';
        }
        
        return col;
    },
        
    processSelect: function (evt) {
        this.selectorTools.handleSelection(evt, this.selection, '#search_bdy tr', "#RowId");
    },
    UpdateRecordCount: function (count){
        $('#reccount').html(count + ' Batches');
    }

}