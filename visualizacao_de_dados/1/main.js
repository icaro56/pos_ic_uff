'use strict';

var myApp = {};

myApp.dataset = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25];

myApp.calculateColor = function (d, maxValue) 
{
    var r = d3.rgb(0,0, (255 * d / maxValue));
    return r;
}

myApp.appendSvg = function(element, x, y, w, h)
{
    var node = d3.select(element).append("svg")
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h);
    
    return node;
}

myApp.appendBars = function (svgCanvas)
{
    var maxValue = -1;
    for (var i = 0; i < myApp.dataset.length; i++)
    {
        if (myApp.dataset[i] > maxValue)
        {
            maxValue = myApp.dataset[i];
        }
    }
    
    var bars = svgCanvas.selectAll("rect")
        .data(myApp.dataset)
        .enter()
        .append("rect")
            .attr("x", function(d, i){ return i*31})
            .attr("y", function(d){return 4*(maxValue - d);})
            .attr("width", 30)
            .attr("height", function(d){ return d*4;})
            .style("fill", function(d){return myApp.calculateColor(d, maxValue);});
    
    svgCanvas.selectAll("text")
        .data(myApp.dataset)
        .enter()
        .append("text")
            .text(function(d) { return d; })
            .attr("text-anchor", "left")
            .attr("x", function(d, i) { return i*31 + 8; })
            .attr("y", function(d) { return 4*(maxValue - d) + 15 })
            .attr("font-family", "sans-serif") 
            .attr("font-size", "11px")
            .attr("fill", "white");
}

myApp.run = function () 
{
    var svg = myApp.appendSvg("#mainDiv", 10, 10, 800, 600);
    var sel = myApp.appendBars(svg);
}

window.onload = myApp.run;