var TableMaker = function() {
    this.selectorTools = new SelectorTools();
    this.pager = new Pager();
    this.qryStrUtils = new QryStrUtils();
    this.tableData;
    this.selection = [];
    this.tableId = 't1';
}

TableMaker.prototype = {
    MakeBody : function(tableData, pagerparams){
        
        this.tableData = tableData;
        
        var tableBody = '';
        var selectEvents = [];
    
        var that = this;

        $.each(tableData.rows, function (index, value) {
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
        
        $('body').on("click", "." + this.tableId, function(evt){
            console.log('testtesttest');
            var colIdx = evt.target.parentElement.attributes["data-col"].value;
            var idVal = evt.target.parentElement.attributes["data-id"].value;
            
            switch (colIdx) {
                case '0':
                    break;
                case '1':
                    if(this.tableData.column2Func)
                        this.tableData.column2Func(evt,idVal);
                    break;
                case '2':
                    if(this.tableData.column3Func)
                        this.tableData.column3Func(evt,idVal);
                    break;
                case '3':
                    if(this.tableData.column4Func)
                        this.tableData.column4Func(evt,idVal);
                    break;
                case '4':
                    if(this.tableData.column5Func)
                        this.tableData.column5Func(evt,idVal);
                    break;
            }
            
            return false;
        });
        
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
            col = '<td><a class = "'+ this.tableId +'" data-col="'+ idx +'" data-id="'+ id +'" href ><div>' + ref + '</div></a></td>';
        }
        else
        {
            col = '<td><div>' + ref + '</div></td>';
        }
        
        return col;
    },
        
    processSelect: function (evt) {
        this.selectorTools.handleSelection(evt, this.selection, '#search_bdy tr', "#RowId");
        
        if(this.tableData && this.tableData.column1Func)
            this.tableData.column1Func(evt);
            
        console.log(evt);
    },
    UpdateRecordCount: function (count){
        $('#reccount').html(count + ' Batches');
    }

}