'use strict';

var myApp = {};

myApp.dataset = [ [5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88] ]; 

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

myApp.appendCircles = function (svgCanvas)
{
    var minYValue = 9999999;
    for (var i = 0; i < myApp.dataset.length; i++)
    {
        if (myApp.dataset[i][1] < minYValue)
        {
            minYValue = myApp.dataset[i][1];
        }
    }
    
    var circle = svgCanvas.selectAll("circle")
        .data(myApp.dataset)
        .enter()
        .append("circle")
            .attr("cx", function(d){ return 10 + d[0];})
            .attr("cy", function(d){return 100 + d[1];})
            .attr("r", function(d){return minYValue/d[1] * 20;});
            
    
    svgCanvas.selectAll("text")
        .data(myApp.dataset)
        .enter()
        .append("text")
            .text(function(d) { return d; })
            .attr("text-anchor", "left")
            .attr("x", function(d, i) { return 20 + d[0]; })
            .attr("y", function(d) { return 100 + d[1] })
            .attr("font-family", "sans-serif") 
            .attr("font-size", "11px")
            .attr("fill", "red");
}

myApp.run = function () 
{
    var svg = myApp.appendSvg("#mainDiv", 10, 10, 800, 600);
    var sel = myApp.appendCircles(svg);
}

window.onload = myApp.run;