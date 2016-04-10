function string_to_number(data, options){
    data.forEach(function(d) {
        options.forEach(function(option) {
            d[option] = +d[option];
        })
    })
    return data;
}

function sort_data(page) {
    options = page.metadata.options;
    options_metadata = page.options_metadata;
    new_data = page.data.slice(0);
    new_data = string_to_number(new_data, options);
    if(page.metadata.sort == "max") {
        new_data.sort(function (a, b) {
            var sum = 0;
            for (i = 0; i < options.length; i++) {
                option_name = options[i];
                sum = sum + (b[option_name] - a[option_name]) * options_metadata[option_name]["parameters"];
            }
            return sum;
        });
    }else if(page.metadata.sort == "min"){
        new_data.sort(function (a, b) {
            var sum = 0;
            for (i = 0; i < options.length; i++) {
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

function produce_text(page){
    name_map = get_name_map(data);
    name = page.metadata.name;
    var text_data = [];
    for (i = 0; i < data.length ; i++){
        current = 0;
        var temp = new Object();
        temp["x"] = 0;
        temp["y"] = name_map[data[i][name]] * page.metadata.bar_height;
        temp["text"] = data[i][name];
        text_data.push(temp);
    }
    page.text_data = text_data;
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
    width = page.metadata.page_info.width;
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
    svg.selectAll(page.metadata.page_name.concat("rect"))
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
    svg.selectAll(page.metadata.page_name.concat("text"))
        .data(page.text_data)
        .enter().append("text")
        .attr("x", function(d) { return d["x"]; })
        .attr("y", function(d) { return d["y"]; })
        .attr("width", 100)
        .text( function(d) { return d["text"]; })
        .attr("transform", "translate("+ (page.metadata.shift - 100) + "," + 37 + ")");
}

function draw_page(page){

    produce_options_metadata(page);
    sort_data(page);
    produce_rect(page);
    produce_text(page);
    draw_text(page);
    draw_rect(page);
}

function initial_bar_width(options, width){
    bar_width = [];
    for(i = 0; i < options.length; i++){
        bar_width.push(width / options.length);
    }
    return bar_width;
}

function initial_page(bar_width, type, sort, shift, data, svg, page_name){
    new_page = new Object();
    new_page.metadata = {
        page_info: page_info,
        colors: colors,
        name: name,
        options: options,
        bar_height: 30,
        bar_width: bar_width,
        type: type,
        sort: sort,
        shift: shift,
        svg: svg,
        page_name: page_name
    }
    new_page.data = data;
    return new_page;
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

function draw_line(page, lines){
    svg.selectAll(page.metadata.page_name.concat("line"))
        .data(lines)
        .enter().append("line")
        .attr("x1", function(d) { return +d["x1"]; })
        .attr("x2", function(d) { return +d["x2"]; })
        .attr("y1", function(d) { return +d["y1"]; })
        .attr("y2", function(d) { return +d["y2"]; })
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("transform", "translate("+ (page.metadata.shift - 450) + "," + 30 + ")");
}