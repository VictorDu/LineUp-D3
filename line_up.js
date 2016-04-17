function string_to_number(data, options){
    data.forEach(function(d) {
        options.forEach(function(option) {
            d[option] = +d[option];
        })
    })
    return data;
}

function sort_data(page) {
    var options = page.metadata.options;
    var options_metadata = page.options_metadata;
    var new_data = page.data.slice(0);
    new_data = string_to_number(new_data, options);
    if(page.metadata.sort == "max") {
        new_data.sort(function (a, b) {
            var sum = 0;
            for (var i = 0; i < options.length; i++) {
                option_name = options[i];
                sum = sum + (b[option_name] - a[option_name]) * options_metadata[option_name]["parameters"];
            }
            return sum;
        });
    }else if(page.metadata.sort == "min"){
        new_data.sort(function (a, b) {
            var sum = 0;
            for (var i = 0; i < options.length; i++) {
                option_name = options[i];
                sum = sum + (a[option_name] - b[option_name]) * options_metadata[option_name]["parameters"];
            }
            return sum;
        });
    }
    page.data = new_data;
}

function produce_rect(page){
    type = page.metadata.type;
    data = page.data;
    options = page.metadata.options;
    options_metadata = page.options_metadata;
    colors = page.metadata.colors;
    name = page.metadata.name;
    name_map = get_name_map(data);
    var rect_data = [];
    for (i =0; i < options.length ; i++) {
        options_metadata[options[i]]["x"].domain([0, 100]);
    }
    for (i = 0; i < data.length ; i++){
        current = 0;
        for( j = 0; j < options.length; j++){
            var temp = new Object();
            option_name =options[j];
            if (type == "stacked bar") {
                temp["x"] = current;
            } else {
                temp["x"] = options_metadata[option_name]["start"];
            }
            temp["width"] = options_metadata[option_name]["x"](data[i][option_name]);
            current += temp["width"];
            temp["y"] = name_map[data[i][name]] * page.metadata.bar_height;
            temp["color"] = colors[option_name];
            rect_data.push(temp);
        }
    }
    page.rect_data = rect_data;
}

function produce_edge(page){
    options = page.metadata.options;
    options_metadata = page.options_metadata;
    var edge_data = [];
    for( j = 0; j < options.length; j++){
        var temp = new Object();
        option_name =options[j];
        temp["x"] = options_metadata[option_name]["start"];
        temp["page"] = page.metadata.page_name
        temp["number"] = j;
        edge_data.push(temp);
    }
    page.edge_data = edge_data;
}


function produce_text(page){
    name_map = get_name_map(data);
    name = page.metadata.name;
    var name_data = [];
    for (i = 0; i < data.length ; i++){
        current = 0;
        var temp = new Object();
        temp["x"] = 0;
        temp["y"] = name_map[data[i][name]] * page.metadata.bar_height;
        temp["text"] = data[i][name];
        name_data.push(temp);
    }
    page.name_data = name_data;
}

function get_name_map(data){
    var name_map = new Object();
    for (i = 0; i < data.length; i++) {
        name_map[data[i][name]] = i;
    }
    return name_map;
}

function produce_options_metadata(page){
    options = page.metadata.options;
    bar_width = page.metadata.bar_width;
    var options_metadata = new Object();
    var current_start = 0;
    for (i =0; i < options.length ; i++) {
        option_name = options[i];
        options_metadata[option_name] = new Object();
        options_metadata[option_name]["parameters"] = bar_width[i];
        options_metadata[option_name]["start"] = current_start;
        option_range = options_metadata[option_name]["parameters"];
        options_metadata[option_name]["x"] = d3.scale.linear().range([0, option_range]);
        current_start = current_start + option_range;
    }
    page.options_metadata = options_metadata;
}

function draw_rect(page){
    page.rect = svg.selectAll("rect".concat(page.metadata.page_name.toString()))
        .data(page.rect_data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return d["x"]; })
        .attr("width", function(d) { return d["width"]; })
        .attr("y", function(d) { return d["y"]; })
        .attr("height", page.metadata.bar_height * 0.75)
        .style("fill", function(d) { return d["color"]; })
        .attr("transform", "translate("+ page.metadata.shift + "," + 20 + ")");
}

function draw_text(page){
    page.name = svg.selectAll("name".concat(page.metadata.page_name.toString()))
        .data(page.name_data)
        .enter().append("text")
        .attr("x", function(d) { return d["x"]; })
        .attr("y", function(d) { return d["y"]; })
        .attr("width", 100)
        .text( function(d) { return d["text"]; })
        .attr("transform", "translate("+ (page.metadata.shift - 100) + "," + 37 + ")");
}

function draw_edge(page){
    page.edge = svg.selectAll("edge".concat(page.metadata.page_name.toString()))
        .data(page.edge_data)
        .enter().append("line")
        .attr("x1", function(d) { return +d["x"]; })
        .attr("x2", function(d) { return +d["x"]; })
        .attr("y1", 0)
        .attr("y2", 10000)
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .attr("transform", "translate("+ page.metadata.shift + "," + 20 + ")")
        .call(drag_horizon);
}

function draw_page(page){
    produce_options_metadata(page);
    sort_data(page);
    produce_rect(page);
    produce_text(page);
    produce_edge(page);
    draw_text(page);
    draw_rect(page);
    draw_edge(page);
}

function initial_bar_width(options, width){
    var bar_width = [];
    for(i = 0; i < options.length; i++){
        bar_width.push(width / options.length);
    }
    return bar_width;
}

function update_shift(number){
    var shift = 100;
    for(var i = 0; i < number; i++){
        for(var j = 0; j < pages[i].metadata.bar_width.length; j++)
            shift += bar_width[j];
        shift += page_interval;
    }
    pages[number].metadata.shift = shift;
}

function initial_page(pages, type, sort, data, svg, page_name){
    var bar_width = initial_bar_width(options, page_width);
    var new_page = new Object();
    new_page.metadata = {
        page_info: page_info,
        colors: colors,
        name: name,
        options: options,
        bar_height: 30,
        bar_width: bar_width,
        type: type,
        sort: sort,
        shift: 0,
        svg: svg,
        page_name: page_name
    }
    new_page.data = data;
    pages.push(new_page);
}

function produce_line(page1, page2){
    result = [];
    name = page1.metadata.name;
    for(var i = 0; i < page1.data.length; i++){
        for(var j = 0; j < page2.data.length; j++){
            if(page1.data[i][name] == page2.data[j][name]){
                line = new Object();
                line["x1"] = 0;
                line["y1"] = i * 30;
                line["x2"] = 300;
                line["y2"] = j * 30;
                result.push(line);
                break;
            }
        }
    }
    return result;
}

function draw_line(page1, page2){
    var lines = produce_line(page1, page2);
    page2.line = svg.selectAll("line".concat(page2.metadata.page_name.toString()))
        .data(lines)
        .enter().append("line")
        .attr("x1", function(d) { return +d["x1"]; })
        .attr("x2", function(d) { return +d["x2"]; })
        .attr("y1", function(d) { return +d["y1"]; })
        .attr("y2", function(d) { return +d["y2"]; })
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("transform", "translate("+ (page2.metadata.shift - 450) + "," + 30 + ")");
}

var drag_horizon = d3.behavior.drag()
    .origin(Object)
    .on("drag", tdragresize);

function tdragresize(d) {
    update(d);
}

function draw(){
    for(var i = 0; i < pages.length; i++){
        update_shift(i);
        draw_page(pages[i]);
    }
    for(i = 1; i < pages.length; i++){
        draw_line(pages[i - 1], pages[i]);
    }
}

function remove_graphic(){
    for(var i = 0; i < pages.length; i++){
        pages[i].rect.remove();
        pages[i].name.remove();
        pages[i].edge.remove();
        if(i != 0)
            pages[i].line.remove();
    }
}

function update(edge){
    if(edge["number"] != 0) {
        remove_graphic();
        var new_bar_width = pages[edge["page"]].metadata.bar_width;
        var page = pages[edge["page"]];
        new_bar_width[edge["number"] - 1] = new_bar_width[edge["number"] - 1] + d3.event.dx;
        page.metadata.bar_width = new_bar_width;
        draw();
    }
}