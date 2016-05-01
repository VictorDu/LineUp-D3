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
            .domain([0,d3.max(hist_data,function(d){//console.log(d);
                return d.y;})])
            .range([0,hist_height]);

        xScale
            .domain([0,hist_data.length])
            .range([0,page.metadata.bar_width[i]]);
        console.log(hist_data);

        for(var j=0; j<hist_data.length; j++){
            var temp = {};
            var option_name =options[i];
            temp["x"] = options_metadata[option_name]["start"]+xScale(j);
            console.log(hist_data[j].y);
            console.log(yScale(hist_data[j].y));
            temp["y"] = hist_height - yScale( hist_data[j].y );
            temp["width"] = hist_bar_width;
            temp["height"] = yScale( hist_data[j].y );
            temp["color"] = page.metadata.colors[option_name];
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