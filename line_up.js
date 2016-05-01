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
    //console.log(page);
    var new_data = page.data.slice(0); // copy data
    new_data = string_to_number(new_data, options);
    if(page.metadata.sort == "max") {
        new_data.sort(function (a, b) {
            var sum = 0;
            for (var i = 0; i < options.length; i++) {
                var option_name = options[i];
                sum = sum + (b[option_name] - a[option_name]) * page.metadata.bar_width[i];
            }
            if(sum == 0)
                return 1;
            return sum;
        });
    }else if(page.metadata.sort == "min"){
        new_data.sort(function (a, b) {
            var sum = 0;
            for (var i = 0; i < options.length; i++) {
                var option_name = options[i];
                sum = sum + (a[option_name] - b[option_name]) * page.metadata.bar_width[i];
            }
            if(sum == 0)
                return 1;
            return sum;
        });
    }
    return new_data;
}

function produce_rect(page){
    var type = page.metadata.type;
    var data = page.data;
    var options = page.metadata.options;
    var options_metadata = page.options_metadata;
    var colors = page.metadata.colors;
    var name = page.metadata.name;
    var name_map = get_name_map(data);
    var rect_data = [];
    for (var i =0; i < options.length ; i++) {
        options_metadata[options[i]]["x"].domain([0, 100]);
    }
    for (var i = 0; i < data.length ; i++){
        var current = 0;
        for( var j = 0; j < options.length; j++){
            var temp = new Object();
            var option_name =options[j];
            if (type == "stacked bar") {
                temp["x"] = current;
            } else {
                temp["x"] = options_metadata[option_name]["start"];
            }
            temp["width"] = options_metadata[option_name]["x"](data[i][option_name]);
            current += temp["width"];
            temp["y"] = name_map[data[i][name]] * page.metadata.bar_height;
            temp["color"] = colors[option_name];
            temp["name"] = data[i][name];
            rect_data.push(temp);
        }
    }
    page.rect_data = rect_data;
}

function produce_highlight_bar(page){
    page.highlight_bar = new Object();
    page.highlight_bar["color"] = "gray";
    page.highlight_bar["x"] = -5;
    page.highlight_bar["y"] = -5000;
    page.highlight_bar["height"] = page.metadata.bar_height + 5;
    page.highlight_bar["width"] = 10;
    page.metadata.bar_width.forEach(function(width) {
        page.highlight_bar["width"] += width;
    });
    page.highlight_bar["width"] += page.metadata.text_shift;
}


function produce_edge(page){
    var options = page.metadata.options;
    var options_metadata = page.options_metadata;
    var edge_data = [];
    for(var j = 0; j < options.length; j++){
        var temp = new Object();
        var option_name =options[j];
        temp["x"] = options_metadata[option_name]["start"];
        temp["page"] = page.metadata.page_name
        temp["number"] = j;
        edge_data.push(temp);
    }
    var last = new Object();
    var option_name =options[options.length - 1];
    last["x"] = options_metadata[option_name]["start"] + page.metadata.bar_width[options.length - 1];
    last["page"] = page.metadata.page_name
    last["number"] = options.length;
    edge_data.push(last);
    page.edge_data = edge_data;
}


function produce_text(page){
    var data = page.data;
    var name_map = get_name_map(data);
    var name = page.metadata.name;
    var name_data = [];
    for (var i = 0; i < data.length ; i++){
        var temp = new Object();
        temp["x"] = 0;
        temp["y"] = name_map[data[i][name]] * page.metadata.bar_height;
        temp["text"] = data[i][name];
        temp["color"] = "white";
        name_data.push(temp);
    }
    page.name_data = name_data;
}

function get_name_map(data){
    var name_map = new Object();
    for (var i = 0; i < data.length; i++) {
        name_map[data[i][name]] = i;
    }
    return name_map;
}

function produce_options_metadata(page){
    var options = page.metadata.options;
    var options_metadata = new Object();
    var current_start = 0;
    for (var i =0; i < options.length ; i++) {
        var option_name = options[i];
        options_metadata[option_name] = new Object();
        options_metadata[option_name]["start"] = current_start;
        var option_range = page.metadata.bar_width[i];
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
        .on("mouseover", function(d) { return handleMouseOver(d["name"]); })
        .attr("transform", "translate("+ (page.metadata.shift + page.metadata.text_shift) + "," + page.metadata.vertical_shift + ")");
}

function draw_text(page){
    page.name_rect = svg.selectAll("name_rect".concat(page.metadata.page_name.toString()))
        .data(page.name_data)
        .enter().append("rect")
        .attr("width", page.metadata.text_shift)
        .attr('height', page.metadata.bar_height * 0.75)
        .attr("x", function(d) { return d["x"]; })
        .attr("y", function(d) { return d["y"]; })
        .style('fill', function(d) { return d["color"]; })
        .attr('stroke', 'black')
        .attr("transform", "translate("+ page.metadata.shift + "," + page.metadata.vertical_shift + ")");


    page.name = svg.selectAll("name".concat(page.metadata.page_name.toString()))
        .data(page.name_data)
        .enter().append("text")
        .attr("x", function(d) { return d["x"]; })
        .attr("y", function(d) { return d["y"]; })
        .attr("width", page.metadata.text_shift)
        .attr("font-size", font_size)
        .text( function(d) { return d["text"]; })
        .on("mouseover", function(d) { return handleMouseOver(d["text"]); })
        .attr("transform", "translate("+ page.metadata.shift + "," + (page.metadata.vertical_shift + text_vertical_shift) + ")");

}

function draw_edge(page){
    page.edge = svg.selectAll("edge".concat(page.metadata.page_name.toString()))
        .data(page.edge_data)
        .enter().append("line")
        .attr("x1", function(d) { return +d["x"]; })
        .attr("x2", function(d) { return +d["x"]; })
        .attr("y1", 0)
        .attr("y2", page.metadata.bar_height * page.data.length)
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .attr("cursor", "ew-resize")
        .attr("transform", "translate("+ (page.metadata.shift + page.metadata.text_shift) + "," + page.metadata.vertical_shift + ")")
        .call(drag_horizon);
}

function draw_highlight_bar(page){
    page.highlight_rect = svg.append("rect")
        .attr("width", page.highlight_bar["width"])
        .attr('height', page.highlight_bar["height"])
        .attr("x", page.highlight_bar["x"])
        .attr("y", page.highlight_bar["y"])
        .style('fill', page.highlight_bar["color"])
        .attr("transform", "translate("+ page.metadata.shift + "," + page.metadata.vertical_shift + ")");
}

function draw_super_line(page){
    page.super_line = svg.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke-width", 10)
        .attr("stroke", "red")
        .attr("transform", "translate("+ (page.metadata.shift - page.metadata.line_width) + "," + (page.metadata.vertical_shift + page.metadata.bar_height * 0.75 * 0.5) + ")");
}

function produce_label(page){
    var total = 0;
    page.metadata.bar_width.forEach(function(width) {
        total += width;
    });
    page.label_info = [];
    for(var i = 0; i < options.length; i++){
        var percentage = Math.round(page.metadata.bar_width[i] / total * 10000) / 100;
        page.label_info.push("" + percentage + "%");
    }
}

function draw_label(page){
    page.label = svg.selectAll("label".concat(page.metadata.page_name.toString()))
        .data(page.label_info)
        .enter().append("text")
        .attr("x", function(d, i) { return page.options_metadata[page.metadata.options[i]]["start"]+
            page.metadata.bar_width[i] * 0.4; })
        .attr("y", 0)
        .attr("width", page.metadata.text_shift)
        .attr("font-size", font_size)
        .text( function(d) { return d; })
        .attr("transform", "translate("+ (page.metadata.shift + page.metadata.text_shift) + "," + (page.metadata.vertical_shift  - 20) + ")");
}

function draw_page(page, sort){
    produce_options_metadata(page);
    if(sort)
        page.data = sort_data(page);
    produce_rect(page);
    produce_text(page);
    produce_edge(page);
    produce_highlight_bar(page);
    produce_label(page);
    draw_highlight_bar(page);
    draw_label(page);
    draw_text(page);
    draw_rect(page);
    draw_edge(page);
    draw_super_line(page);
}

function initial_bar_width(options, width){
    var bar_width = [];
    for(var i = 0; i < options.length; i++){
        bar_width.push(width / options.length);
    }
    return bar_width;
}

function update_shift(number){
    var shift = 0;
    for(var i = 0; i < number; i++){
        for(var j = 0; j < pages[i].metadata.bar_width.length; j++)
            shift += pages[i].metadata.bar_width[j];
        shift = shift + page_interval + pages[i].metadata.text_shift;
    }
    pages[number].metadata.shift = shift;
}

function initial_page(type, sort, data){
    var bar_width = initial_bar_width(options, page_width);
    var new_page = new Object();
    new_page.metadata = {
        page_info: page_info,
        colors: colors,
        name: name,
        options: options,
        bar_height: bar_height,
        bar_width: bar_width,
        text_shift: text_shift,
        line_width: page_interval,
        type: type,
        sort: sort,
        shift: 0,
        vertical_shift: vertical_shift,
        page_name: pages.length
    }
    new_page.data = data;
    pages.push(new_page);
}

function produce_line(page1, page2){
    var result = [];
    var name = page1.metadata.name;
    for(var i = 0; i < page1.data.length; i++){
        for(var j = 0; j < page2.data.length; j++){
            if(page1.data[i][name] == page2.data[j][name]){
                var line = new Object();
                line["x1"] = 0;
                line["y1"] = i * page1.metadata.bar_height;
                line["x2"] = page_interval;
                line["y2"] = j * page1.metadata.bar_height;
                line["name"] = page1.data[i][name];
                result.push(line);
                break;
            }
        }
    }
    return result;
}


function draw_line(page1, page2){
    var lines = produce_line(page1, page2);
    var vertical_shift = page1.metadata.vertical_shift + page1.metadata.bar_height * 0.75 * 0.5;
    page2.line_info = lines;
    page2.line = svg.selectAll("line".concat(page2.metadata.page_name.toString()))
        .data(lines)
        .enter().append("line")
        .attr("x1", function(d) { return +d["x1"]; })
        .attr("x2", function(d) { return +d["x2"]; })
        .attr("y1", function(d) { return +d["y1"]; })
        .attr("y2", function(d) { return +d["y2"]; })
        .attr("stroke-width", 2)
        .attr("stroke", "blue")
        .attr("transform", "translate("+ (page2.metadata.shift - page2.metadata.line_width) + "," + vertical_shift + ")");
}

var drag_horizon = d3.behavior.drag()
    .origin(Object)
    .on("drag", tdragresize);

function tdragresize(d) {
    //console.log(d);
    update(d);
}

function draw(sort){
    for(var i = 0; i < pages.length; i++){
        update_shift(i);
        draw_page(pages[i], sort);
        transition(pages[i]);
    }
    for(var i = 1; i < pages.length; i++){
        draw_line(pages[i - 1], pages[i]);
    }
}

function remove_graphic(){
    for(var i = 0; i < pages.length; i++){
        pages[i].rect.remove();
        pages[i].edge.remove();
        pages[i].name.remove();
        pages[i].name_rect.remove();
        pages[i].highlight_rect.remove();
        pages[i].super_line.remove();
        pages[i].label.remove();
        if(i != 0)
            pages[i].line.remove();
    }
}

function update(edge){
    remove_graphic();
    if(edge["number"] != 0) {
        var page = pages[edge["page"]];
        var new_bar_width = page.metadata.bar_width;
        new_bar_width[edge["number"] - 1] = new_bar_width[edge["number"] - 1] + d3.event.dx;
        page.metadata.bar_width = new_bar_width;
    }else{
        pages[edge["page"]].metadata.text_shift += d3.event.dx;
    }
    draw(false);
}

function transition(page){
    var new_data = sort_data(page);
    var old_data = page.data;
    page.data = new_data;
    var dict = {};
    for(var i = 0; i < new_data.length; i++){
        dict[new_data[i][name]] = i;
    }
    var new_color = [];
    var new_y = [];
    for(var i = 0; i < old_data.length; i++){
        var n = dict[old_data[i][name]];
        new_y.push(n * page.metadata.bar_height);
        if(n == i)
            new_color.push(page.name_data[i]["color"]);
        else if(n > i)
            new_color.push("red");
        else
            new_color.push("green");
    }
    page.rect.transition()
        .duration(500)
        .attr("y", function(d, i) { return new_y[Math.floor( i / options.length)]; });
    page.name_rect.transition()
        .style('fill', function(d, i) { return new_color[i]; });
    page.name.transition()
        .attr("y", function(d, i) { return new_y[i];} );
}

function handleMouseOver(name) {
    for(var page_number = 0; page_number < pages.length; page_number++) {
        var page_data = pages[page_number].data;
        var name_info = pages[page_number].metadata.name;
        var index = 10000;
        for (var i = 0; i < page_data.length; i++) {
            if (page_data[i][name_info] == name) {
                index = i;
            }
        }
        pages[page_number].highlight_rect.transition()
            .attr("y", index * pages[page_number].metadata.bar_height - 5);
    }
    for(var page_number = 1; page_number < pages.length; page_number++) {
        var line_info = pages[page_number].line_info;
        var index = 10000;
        for (var i = 0; i < line_info.length; i++) {
            if (line_info[i]["name"] == name) {
                index = i;
            }
        }
        pages[page_number].super_line.transition()
            .attr("x1", line_info[index]["x1"])
            .attr("x2", line_info[index]["x2"])
            .attr("y1", line_info[index]["y1"])
            .attr("y2", line_info[index]["y2"]);
    }
}
function initial_chart(){
    var color = d3.scale.category20();
    colors = {};
    options.forEach(function(option) {
        colors[option] = color(option);
    })
    if (typeof svg === "undefined") {
        svg = d3.select("body").append("svg")
            .attr("width", page_info.width + page_info.left + page_info.right)
            .attr("height", page_info.height + page_info.top + page_info.bottom)
            .append("g")
            .attr("transform", "translate(" + page_info.left + "," + page_info.top + ")");
    }else{
        remove_graphic();
        labels_text.remove();
        labels_rect.remove();
    }

    labels = [], pages = [];

    for(var i = 0; i < options.length; i++){
        var label = new Object();
        label["name"] = options[i];
        label["color"] = colors[label["name"]];
        label["x"] = label_horizon_shift * i;
        label["y"] = 0;
        label["text_x"] = label["x"] + 2 * bar_height;
        label["width"] = bar_height;
        label["height"] = bar_height;
        labels.push(label);
    }

    labels_rect = svg.selectAll("labels_rect")
        .data(labels)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return d["x"]; })
        .attr("width", function(d) { return d["width"]; })
        .attr("y", function(d) { return d["y"]; })
        .attr("height", function(d) { return d["height"]; })
        .style("fill", function(d) { return d["color"]; })
        .attr("transform", "translate(0," + label_vertical_shift + ")");

    labels_text = svg.selectAll("labels_text")
        .data(labels)
        .enter().append("text")
        .attr("x", function(d) { return d["text_x"]; })
        .attr("y", function(d) { return d["y"] + text_vertical_shift; })
        .attr("font-size", font_size)
        .text( function(d) { return d["name"]; })
        .attr("transform", "translate(0," + label_vertical_shift + ")");
}

function line_up(path, charts){
    d3.json(path, function(data) {
        options = data.options;
        file_path = data.file_path;
        name = data.name;
        d3.csv(file_path, function(data) {
            initial_chart();
            charts.forEach(function(chart) {
                initial_page(chart, "max", data);
            })
            draw(true);
        });
    });
}