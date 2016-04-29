function vertiBar(x,y,height,width,data,column,num){
    var yScale = d3.scale.linear()
        .range([0,height]);

    var xScale = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeRoundBands([0,width],.1);

    var bars = svg.selectAll("verti_rect"+num).data(data);
    bars.enter().append("rect");
    bars
        .attr("class","bar")
        .attr("x",function (d,i){return xScale(i); })//d will be a row of data
        .attr("width",xScale.rangeBand())
        .attr("transform","translate("+x+","+y+")");
    if(column==null){
        yScale
            .domain([0,d3.max(data)]);
        bars
            .attr("height",function(d){return yScale(d); })
            .attr("y",function(d){return height-yScale(d);});
    }else {
        yScale.domain([0,d3.max(data,function(d){return d[column];})]);
        bars
            .attr("height", function(d){return yScale(d[column]); })
            .attr("y",function(d){return height-yScale(d[column]); });
    }
    console.log(bars);
}

function produce_verti(page){
    var options = page.metadata.options;
    var options_metadata = page.options_metadata;
    var verti_bat_data=[];
    for(i=0;i<options.length;i++){
        var temp = new Object();
        var option_name =options[i];
        temp["x"] = options_metadata[option_name]["start"];
        temp["width"] = page.metadata.bar_width[i];
        temp["page"] = page.metadata.page_name;
        temp["column_name"] = option_name;
        verti_bat_data.push(temp);
    }
    page.verti_data = verti_bat_data;
}

function draw_verti(page){
    var num = page.metadata.options.length;
    var info = page.verti_data;
    for(i=0;i<num;i++){
        vertiBar(info[i]["x"],200,200,info[i]["width"],page.data,info[i]["column_name"],i);
    }
}