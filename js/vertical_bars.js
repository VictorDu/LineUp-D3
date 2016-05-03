function produce_verti(page){
    var hist_bar_width = 10;
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var options = page.metadata.options;
    var options_metadata = page.options_metadata;
    var hist_rect_data = [];
    var hist_data;

    for(var i = 0; i< options.length; i++){
        hist_data = d3.layout.histogram()
            .value(function(d) {return d[page.metadata.options[i]]; })
            .bins(Math.floor( page.metadata.bar_width[i]/hist_bar_width ))(page.data);

        yScale
            .domain([0,d3.max(hist_data, function(d){return d.y;})])
            .range([0,hist_height]);

        xScale
            .domain([0,hist_data.length])
            .range([0,page.metadata.bar_width[i]]);

        for(var j=0; j<hist_data.length; j++){
            var temp = {};
            var option_name =options[i];
            temp["x"] = options_metadata[option_name]["start"]+xScale(j);
            temp["y"] = hist_height - yScale( hist_data[j].y );
            temp["width"] = hist_bar_width;
            temp["height"] = yScale( hist_data[j].y );
            temp["color"] = page.metadata.colors[option_name];
            //todo: may not need category
            temp["category"] = option_name;
            temp["names"] = d3.map(hist_data[j],function(d){return d[page.metadata.name];}).keys();
            hist_rect_data.push(temp);
        }
    }
    page.hist_bar_data = hist_rect_data;

}

function draw_verti(page){
    page.hist_bars = svg.selectAll("hist_rect".concat(page.metadata.page_name.toString()))
        .data(page.hist_bar_data)
        .enter().append("rect")
        .attr("x",function(d){ return d.x; })
        .attr("y",function(d){ return d.y; })
        .attr("width", function(d){ return d.width; })
        .attr("height", function(d){return d.height;})
        .style("fill", function(d){return d.color;})
        .attr("transform", "translate("+ (page.metadata.shift + page.metadata.text_shift) + "," + (page.metadata.vertical_shift-hist_height-50) + ")");
}

function produce_highlight_hist(page){
    if(page.hist_bar_data){
        var highlight_hist = [];
        for( var i=0; i<page.metadata.options.length; i++ ){
            highlight_hist[i] = {};
            highlight_hist[i]["x"] = -10;
            highlight_hist[i]["y"] = -10;
            highlight_hist[i]["width"] = 0;
            highlight_hist[i]["height"] = 0;
        }
        page.highlight_hist = highlight_hist;
    }
}

function draw_highlight_hist(page){
    if(page.highlight_hist){
        page.highlight_hist_rects = [];
        for(var i=0; i<page.highlight_hist.length;i++){
            var hist_rect = svg.append("rect")
                .attr("width", page.highlight_hist[i]["width"])
                .attr('height', page.highlight_hist[i]["height"])
                .attr("x", page.highlight_hist[i]["x"])
                .attr("y", page.highlight_hist[i]["y"])
                .style('fill', "gray")
                .style("opacity",.6)
                .attr("transform", "translate("+ (page.metadata.shift + page.metadata.text_shift) + "," + (page.metadata.vertical_shift-hist_height-50) + ")");
            page.highlight_hist_rects.push(hist_rect);
        }
    }
}

function mouse_over_hist(name,page){
    if(page.hist_bar_data){
        var indexes = search_hist(name,page.hist_bar_data);
        for( var i=0; i<indexes.length; i++ ){
            var hist_data = page.hist_bar_data;
            page.highlight_hist_rects[i].transition()
                .attr("width",hist_data[indexes[i]].width)
                .attr("height",hist_data[indexes[i]].height)
                .attr("x",hist_data[indexes[i]].x)
                .attr("y",hist_data[indexes[i]].y);
        }
    }
}

function search_hist(name,data){
    var index = [];
    var arr = [];
    for( var i=0; i<data.length; i++ ){
        arr = data[i]["names"];
        if(arr.indexOf(name)!=-1){
            index.push(i);
        }
    }
    return index;
}