var TableMaker = function() {
    this.selectorTools = new SelectorTools();
    this.pager = new Pager();
    this.qryStrUtils = new QryStrUtils();
    this.tableData;
    this.selection = [];
    this.tpSelection ;
    this.tableId = 't1';
}

TableMaker.prototype = {
    MakeBody : function(tableData, pagerparams){
        
        this.tableData = tableData;
        
        var tableBody = '';
        this.tpSelection = [];
    
        var that = this;

        $.each(tableData.rows, function (index, value) {
            tableBody += that.makeRow(value);  
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

        this.selectorTools.addlinks(this.tpSelection, this.processSelect, this);
        
        $('body').on("click", "." + this.tableId, function(evt){
            console.log('testtesttest');
            var colIdx = evt.target.parentElement.attributes["data-col"].value;
            var idVal = evt.target.parentElement.attributes["data-id"].value;
            var href = evt.target.parentElement.attributes["href"].value;
            
            href = href === undefined ? '' : href;
            
            switch (colIdx) {
                case '0':
                    break;
                case '1':
                    if(that.tableData.column1Func)
                        that.tableData.column1Func(evt,idVal);
                    break;
                case '2':
                    if(that.tableData.column2Func)
                        that.tableData.column2Func(evt,idVal);
                    break;
                case '3':
                    if(that.tableData.column3Func)
                        that.tableData.column3Func(evt,idVal);
                    break;
                case '4':
                    if(that.tableData.column4Func)
                        that.tableData.column4Func(evt,idVal);
                    break;
                case '5':
                    if(that.tableData.column5Func)
                        that.tableData.column5Func(evt,idVal);
                    break;
            }
            
            if(href.indexOf("htm") > -1)
                return true;
            else
                return false;
            
        });
        
    },
    
    makeRow : function(rowData){
        
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

        
        tableRow += that.makeColumn(1,rowData.idx, rowData.id, rowData.column1.isLink, rowData.column1.ref,rowData.column1.className,rowData.column1.title,rowData.column1.href,rowData.column1.key);
        tableRow += that.makeColumn(2,rowData.idx, rowData.id, rowData.column2.isLink, rowData.column2.ref,rowData.column2.className,rowData.column2.title,rowData.column2.href,rowData.column2.key);
        tableRow += that.makeColumn(3,rowData.idx, rowData.id, rowData.column3.isLink, rowData.column3.ref,rowData.column3.className,rowData.column3.title,rowData.column3.href,rowData.column3.key);
        tableRow += that.makeColumn(4,rowData.idx, rowData.id, rowData.column4.isLink, rowData.column4.ref,rowData.column4.className,rowData.column4.title,rowData.column4.href,rowData.column4.key);
        tableRow += that.makeColumn(5,rowData.idx, rowData.id, rowData.column5.isLink, rowData.column5.ref,rowData.column5.className,rowData.column5.title,rowData.column5.href,rowData.column5.key);
        tableRow += that.makeColumn(6,rowData.idx, rowData.id, rowData.column6.isLink, rowData.column6.ref,rowData.column6.className,rowData.column6.title,rowData.column6.href,rowData.column6.key);
        tableRow += that.makeColumn(7,rowData.idx, rowData.id, rowData.column7.isLink, rowData.column7.ref,rowData.column7.className,rowData.column7.title,rowData.column7.href,rowData.column7.key);
        
        tableRow += '</tr>';
        
        return tableRow;
    },
    
    makeColumn : function(idx,rowIdx, id, isLink, ref,classArg,titleArg,hrefArg, keyArg ){
            
        var col = '';
        //this.tpSelection
        if(keyArg && isLink){
            col = '<td><a id= "s' + rowIdx + '" href="" ><div>' + ref + '</div></a></td>';
            if(id == undefined) console.log('id not set');
            this.tpSelection.push({ key: 's' + rowIdx, value: id });
            return col;
        }
        var classParam ='';
        
        var titleParam ='';
        
        var hrefParam =' href ';
        
        if(titleArg)
            titleParam =' title = "'+ titleArg + '" ';
        
        if(classArg)
            classParam =' class = "'+ classArg + '" ';  
            
        if(hrefArg)            
            hrefParam =' href = "' + hrefArg + '" ';
            
        if(isLink){
            col = '<td ' + classParam +' ><a class = "'+ this.tableId +'" data-col="'+ idx +'" data-id="'+ id +'" ' + hrefParam +' ><div ' + titleParam + ' >' + ref + '</div></a></td>';
        }
        else
        {
            col = '<td ' + classParam +' ><div ' + titleParam + ' >' + ref + '</div></td>';
        }
        
        return col;
    },
        
    processSelect: function (evt) {
        //'#search_bdy tr', "#source_id"
       this.selection = this.selectorTools.handleSelection(evt, this.selection, '#search_bdy tr', "#RowId");
        
        if(this.tableData && this.tableData.column1Func)
            this.tableData.column1Func(evt);
            
        console.log(evt);
    },
    UpdateRecordCount: function (count){
        $('#reccount').html(count + ' Batches');
    }

}